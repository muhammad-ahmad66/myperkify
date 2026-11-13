import { z } from 'zod';
import type { Claim } from '@/features/claims/types';
import { API_ERROR_CODES } from '@/lib/api/types';
import { allDeals, getDb, nextId, type MockClaim, type MockUser } from '../db';
import { HttpError, invalid, notFound, ok, readJson } from '../http';
import { mintPass } from '../qr';
import { requireUser, requireVerified } from '../session';

const CLAIM_WINDOW_MS = 5 * 60 * 1000;

const createClaimBody = z.object({
  dealId: z.string(),
  optionId: z.string(),
  branchId: z.string(),
});

/** Expiry is applied on read, using server time only. */
export function settle(claim: MockClaim): MockClaim {
  if (claim.status === 'pending' && Date.now() >= claim.expiresAt) claim.status = 'expired';
  return claim;
}

function liveClaims(): MockClaim[] {
  return [...getDb().claims.values()].map(settle).filter((claim) => claim.status === 'pending');
}

/** Codes only need to be unique among live claims at the same store. */
function generateCode(dealId: string): string {
  const taken = new Set(
    liveClaims()
      .filter((c) => c.dealId === dealId)
      .map((c) => c.code),
  );
  let code: string;
  do {
    code = String(1000 + Math.floor(Math.random() * 9000));
  } while (taken.has(code));
  return code;
}

function startOfToday(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

export function usedToday(userId: string, dealId: string): number {
  return [...getDb().claims.values()].filter(
    (claim) =>
      claim.userId === userId &&
      claim.dealId === dealId &&
      claim.status === 'redeemed' &&
      claim.createdAt >= startOfToday(),
  ).length;
}

function toClaim(claim: MockClaim, user: MockUser): Claim {
  const deal = allDeals().find((entry) => entry.id === claim.dealId)!;
  const option = deal.options.find((entry) => entry.id === claim.optionId)!;
  const branch = deal.branches.find((entry) => entry.id === claim.branchId);
  return {
    id: claim.id,
    code: claim.code,
    status: claim.status,
    dealSlug: deal.slug,
    brandName: deal.brand.name,
    brandInitials: deal.brand.initials,
    brandColor: deal.brand.color,
    branchName: branch?.name ?? 'Removed branch',
    optionLabel: option.label,
    amount: option.studentPrice,
    saved: option.regularPrice - option.studentPrice,
    expiresAt: new Date(claim.expiresAt).toISOString(),
    serverNow: new Date().toISOString(),
    transactionId: claim.transactionId,
    orderId: claim.orderId,
    receiptEmail: user.email,
  };
}

export async function createClaim(request: Request): Promise<Response> {
  const user = requireVerified(request);
  const body = await readJson(request, createClaimBody);

  const deal = allDeals().find((entry) => entry.id === body.dealId);
  const option = deal?.options.find((entry) => entry.id === body.optionId);
  const branch = deal?.branches.find((entry) => entry.id === body.branchId);
  if (!deal || !option || !branch) throw invalid('That option is no longer available.');

  if (getDb().merchants.get(deal.merchantId)?.status !== 'active') {
    // Neutral on purpose. Students never hear about a shop's commission balance.
    throw new HttpError(
      409,
      API_ERROR_CODES.merchantOnHold,
      "This deal isn't available right now. Try again soon.",
    );
  }

  if (!branch.isOpen) {
    throw new HttpError(
      409,
      API_ERROR_CODES.branchClosed,
      `${branch.name} is closed right now. Pick another branch.`,
    );
  }

  const existing = liveClaims().find(
    (claim) => claim.userId === user.id && claim.dealId === deal.id,
  );
  if (existing) return ok(toClaim(existing, user));

  if (usedToday(user.id, deal.id) >= deal.claimsPerDay) {
    throw new HttpError(
      409,
      API_ERROR_CODES.limitReached,
      "You've used this deal today. Come back tomorrow for another claim.",
    );
  }

  const claim: MockClaim = {
    id: nextId('claim'),
    code: generateCode(deal.id),
    userId: user.id,
    dealId: deal.id,
    optionId: option.id,
    branchId: branch.id,
    status: 'pending',
    expiresAt: Date.now() + CLAIM_WINDOW_MS,
    transactionId: null,
    orderId: null,
    approvedAt: null,
    createdAt: Date.now(),
  };
  getDb().claims.set(claim.id, claim);
  return ok(toClaim(claim, user), 201);
}

function findOwnClaim(request: Request, id: string): { claim: MockClaim; user: MockUser } {
  const user = requireUser(request);
  const claim = getDb().claims.get(id);
  if (!claim || claim.userId !== user.id) throw notFound("We couldn't find that claim.");
  return { claim: settle(claim), user };
}

export function getClaim(request: Request, id: string): Response {
  const { claim, user } = findOwnClaim(request, id);
  return ok(toClaim(claim, user));
}

export function getLiveClaim(request: Request): Response {
  const user = requireVerified(request);
  const slug = new URL(request.url).searchParams.get('dealSlug');
  const deal = allDeals().find((entry) => entry.slug === slug);
  const claim = liveClaims().find((c) => c.userId === user.id && c.dealId === deal?.id);
  return ok(claim ? toClaim(claim, user) : null);
}

/** A fresh QR token for a live claim. The phone asks again before each one expires. */
export function getClaimPass(request: Request, id: string): Response {
  const { claim } = findOwnClaim(request, id);
  if (claim.status !== 'pending') {
    throw new HttpError(409, API_ERROR_CODES.validation, 'This code is no longer live.');
  }
  const { token, expiresAt } = mintPass(claim.id);
  return ok({
    token,
    expiresAt: new Date(Math.min(expiresAt, claim.expiresAt)).toISOString(),
    serverNow: new Date().toISOString(),
  });
}

export function cancelClaim(request: Request, id: string): Response {
  const { claim } = findOwnClaim(request, id);
  if (claim.status === 'pending') claim.status = 'cancelled';
  return ok({ status: claim.status });
}
