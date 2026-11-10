import { branchFormSchema } from '@/features/merchant/schemas';
import { API_ERROR_CODES } from '@/lib/api/types';
import { formatTimeOfDay } from '@/lib/format';
import { allDeals, getDb, nextId, type MockMerchant } from '../db';
import { HttpError, notFound, ok, readJson } from '../http';
import type { SeedBranch } from '../seed/deals';
import { requireRole } from '../session';

const MINUTES_IN_DAY = 24 * 60;

function minutesOf(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function nowInPakistan(): number {
  const time = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
  });
  return minutesOf(time);
}

/** Handles hours that run past midnight, such as 11:00 to 01:00. */
export function isOpenAt(opensAt: string, closesAt: string, now: number): boolean {
  const opens = minutesOf(opensAt);
  const closes = minutesOf(closesAt);
  const end = closes > opens ? closes : closes + MINUTES_IN_DAY;
  const current = now < opens ? now + MINUTES_IN_DAY : now;
  return current >= opens && current < end;
}

function withStatus(branch: Omit<SeedBranch, 'isOpen' | 'statusLabel'>): SeedBranch {
  if (!branch.opensAt || !branch.closesAt) {
    return { ...branch, isOpen: true, statusLabel: 'Hours not set' };
  }
  const isOpen = isOpenAt(branch.opensAt, branch.closesAt, nowInPakistan());
  return {
    ...branch,
    isOpen,
    statusLabel: isOpen
      ? `Open until ${formatTimeOfDay(branch.closesAt)}`
      : `Opens at ${formatTimeOfDay(branch.opensAt)}`,
  };
}

/** Shops own their branches. Deals show a copy, so a change reaches every in-store deal. */
export function syncBranches(merchant: MockMerchant): void {
  allDeals()
    .filter((deal) => deal.merchantId === merchant.id && deal.mode !== 'online')
    .forEach((deal) => {
      deal.branches = merchant.branches;
    });
}

function ownStore(request: Request): MockMerchant {
  const user = requireRole(request, 'merchant_owner');
  const merchant = getDb().merchants.get(user.merchantId ?? '');
  if (!merchant) throw notFound("We couldn't find your store.");
  return merchant;
}

function blocked(message: string): HttpError {
  return new HttpError(409, API_ERROR_CODES.validation, message);
}

export async function createBranch(request: Request): Promise<Response> {
  const merchant = ownStore(request);
  const values = await readJson(request, branchFormSchema);
  const branch = withStatus({ ...values, id: nextId('branch'), distance: '' });
  merchant.branches = [...merchant.branches, branch];
  syncBranches(merchant);
  return ok(branch, 201);
}

export async function updateBranch(request: Request, id: string): Promise<Response> {
  const merchant = ownStore(request);
  const values = await readJson(request, branchFormSchema);
  const current = merchant.branches.find((branch) => branch.id === id);
  if (!current) throw notFound("We couldn't find that branch.");
  const branch = withStatus({ ...current, ...values });
  merchant.branches = merchant.branches.map((entry) => (entry.id === id ? branch : entry));
  syncBranches(merchant);
  return ok(branch);
}

/** Refuses anything that would strand a student at the counter or a cashier without a branch. */
export function deleteBranch(request: Request, id: string): Response {
  const merchant = ownStore(request);
  const db = getDb();
  if (!merchant.branches.some((branch) => branch.id === id)) {
    throw notFound("We couldn't find that branch.");
  }

  const dealIds = new Set(
    allDeals()
      .filter((deal) => deal.merchantId === merchant.id)
      .map((deal) => deal.id),
  );
  const liveClaim = [...db.claims.values()].some(
    (claim) => claim.branchId === id && claim.status === 'pending' && dealIds.has(claim.dealId),
  );
  if (liveClaim) throw blocked('A student has a live code at this branch. Try again shortly.');

  const cashier = [...db.users.values()].find((user) => user.branchId === id);
  if (cashier) throw blocked(`${cashier.name} works at this branch. Move them first.`);

  const hasLiveInStoreDeal = allDeals().some(
    (deal) => deal.merchantId === merchant.id && deal.status === 'live' && deal.mode !== 'online',
  );
  if (merchant.branches.length === 1 && hasLiveInStoreDeal) {
    throw blocked('Keep at least one branch while an in-store deal is live.');
  }

  merchant.branches = merchant.branches.filter((branch) => branch.id !== id);
  syncBranches(merchant);
  return ok({ removed: true });
}
