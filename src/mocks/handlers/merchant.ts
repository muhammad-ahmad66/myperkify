import { z } from 'zod';
import { API_ERROR_CODES } from '@/lib/api/types';
import { allDeals, getDb, nextId, type MockClaim, type MockOrder, type MockUser } from '../db';
import { HttpError, invalid, notFound, ok, readJson } from '../http';
import { applySettlement, balanceOf, completeOrder, transactionId } from '../ledger';
import { requireRole, universityName } from '../session';
import { settle } from './claims';
import { toOrder } from './orders';

function merchantOf(user: MockUser) {
  const merchant = getDb().merchants.get(user.merchantId ?? '');
  if (!merchant) throw notFound("We couldn't find your store.");
  return merchant;
}

function claimDetails(claim: MockClaim) {
  const db = getDb();
  const deal = allDeals().find((entry) => entry.id === claim.dealId);
  const option = deal?.options.find((entry) => entry.id === claim.optionId);
  // A branch can be removed after its claims are done, so history keeps working without it.
  const branch = deal?.branches.find((entry) => entry.id === claim.branchId);
  const student = db.users.get(claim.userId);
  if (!deal || !option || !student) throw notFound();
  return { deal, option, branchName: branch?.name ?? 'Removed branch', student };
}

/** A cashier sees their own branch. An owner sees every branch of their own store. */
function visibleClaims(user: MockUser): MockClaim[] {
  const db = getDb();
  return [...db.claims.values()].map(settle).filter((claim) => {
    const deal = allDeals().find((entry) => entry.id === claim.dealId);
    if (deal?.merchantId !== user.merchantId) return false;
    return !user.branchId || claim.branchId === user.branchId;
  });
}

export function listClaims(request: Request): Response {
  const user = requireRole(request, 'cashier', 'merchant_owner');
  const claims = visibleClaims(user);
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  const pending = claims
    .filter((claim) => claim.status === 'pending')
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((claim) => {
      const { deal, option, branchName, student } = claimDetails(claim);
      return {
        id: claim.id,
        code: claim.code,
        studentName: student.name,
        university: universityName(student),
        item: `${deal.brand.name}: ${option.label}`,
        branchName,
        amount: option.studentPrice,
        expiresAt: new Date(claim.expiresAt).toISOString(),
        serverNow: new Date().toISOString(),
      };
    });

  const completedToday = claims
    .filter((claim) => claim.status === 'redeemed' && (claim.approvedAt ?? 0) >= startOfDay)
    .sort((a, b) => (b.approvedAt ?? 0) - (a.approvedAt ?? 0))
    .map((claim) => {
      const { option, student } = claimDetails(claim);
      return {
        id: claim.id,
        studentName: student.name,
        university: universityName(student),
        approvedAt: new Date(claim.approvedAt ?? 0).toISOString(),
        amount: option.studentPrice,
      };
    });

  return ok({ pending, completedToday });
}

/**
 * Safe to call twice, so a double tap cannot make two orders or two commissions. Server time
 * decides expiry, and a cashier can only approve a claim at their own store and branch.
 */
export function approveClaim(request: Request, id: string): Response {
  const user = requireRole(request, 'cashier', 'merchant_owner');
  const claim = visibleClaims(user).find((entry) => entry.id === id);
  if (!claim) throw notFound("We couldn't find that claim.");
  return ok(redeemClaim(claim));
}

export function redeemClaim(claim: MockClaim) {
  const db = getDb();
  settle(claim);
  if (claim.status === 'redeemed') return { status: claim.status };
  if (claim.status !== 'pending') {
    throw new HttpError(409, API_ERROR_CODES.codeExpired, 'This code has expired.');
  }

  const { deal, option, branchName, student } = claimDetails(claim);
  const order: MockOrder = {
    id: nextId('order'),
    number: transactionId(),
    studentId: student.id,
    studentName: student.name,
    studentUniversity: universityName(student),
    merchantId: deal.merchantId,
    source: 'in_store',
    claimId: claim.id,
    items: [
      {
        dealId: deal.id,
        title: `${deal.brand.name}: ${option.label}`,
        regularPrice: option.regularPrice,
        studentPrice: option.studentPrice,
        quantity: 1,
      },
    ],
    subtotal: option.regularPrice,
    discount: option.regularPrice - option.studentPrice,
    deliveryFee: 0,
    total: option.studentPrice,
    paymentMethod: 'cash_counter',
    status: 'processing',
    deliveryAddress: null,
    branchName,
    checkoutId: null,
    createdAt: Date.now(),
    completedAt: null,
  };
  db.orders.set(order.id, order);
  completeOrder(order);

  claim.status = 'redeemed';
  claim.approvedAt = Date.now();
  claim.transactionId = order.number;
  claim.orderId = order.id;
  return { status: claim.status };
}

function merchantOrders(merchantId: string): MockOrder[] {
  return [...getDb().orders.values()]
    .filter((order) => order.merchantId === merchantId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getOverview(request: Request): Response {
  const user = requireRole(request, 'merchant_owner');
  const merchant = merchantOf(user);
  const startOfDay = new Date().setHours(0, 0, 0, 0);
  const today = merchantOrders(merchant.id).filter(
    (order) => order.status === 'completed' && (order.completedAt ?? 0) >= startOfDay,
  );
  const { threshold } = getDb().settings;

  return ok({
    pendingClaims: visibleClaims(user).filter((claim) => claim.status === 'pending').length,
    newOrders: merchantOrders(merchant.id).filter((order) => order.status === 'placed').length,
    salesToday: today.reduce((sum, order) => sum + order.total, 0),
    claimsToday: today.filter((order) => order.source === 'in_store').length,
    balance: balanceOf(merchant.id),
    threshold,
    status: merchant.status,
  });
}

export function listMerchantOrders(request: Request): Response {
  const user = requireRole(request, 'merchant_owner');
  return ok(merchantOrders(merchantOf(user).id).map(toOrder));
}

const NEXT_STATUS: Partial<Record<MockOrder['status'], MockOrder['status'][]>> = {
  placed: ['processing', 'cancelled'],
  processing: ['dispatched', 'cancelled'],
  dispatched: ['completed'],
};

export async function updateOrderStatus(request: Request, id: string): Promise<Response> {
  const user = requireRole(request, 'merchant_owner');
  const { status } = await readJson(
    request,
    z.object({ status: z.enum(['processing', 'dispatched', 'completed', 'cancelled']) }),
  );
  const order = getDb().orders.get(id);
  if (!order || order.merchantId !== user.merchantId) {
    throw notFound("We couldn't find that order.");
  }
  if (!NEXT_STATUS[order.status]?.includes(status)) {
    throw new HttpError(409, API_ERROR_CODES.validation, 'This order has already moved on.');
  }
  if (status === 'completed') completeOrder(order);
  else order.status = status;
  return ok(toOrder(order));
}

export function getLedger(request: Request): Response {
  const user = requireRole(request, 'merchant_owner');
  const merchant = merchantOf(user);
  const db = getDb();
  return ok({
    balance: balanceOf(merchant.id),
    threshold: db.settings.threshold,
    status: merchant.status,
    commissionRate: db.settings.commissionRate,
    entries: db.ledger
      .filter((entry) => entry.merchantId === merchant.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((entry) => ({
        id: entry.id,
        type: entry.type,
        orderNumber: entry.orderNumber,
        saleValue: entry.saleValue,
        amount: entry.amount,
        createdAt: new Date(entry.createdAt).toISOString(),
      })),
    settlements: [...db.settlements.values()]
      .filter((settlement) => settlement.merchantId === merchant.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((settlement) => ({
        id: settlement.id,
        amount: settlement.amount,
        reference: settlement.reference,
        status: settlement.status,
        createdAt: new Date(settlement.createdAt).toISOString(),
      })),
  });
}

export async function submitSettlement(request: Request): Promise<Response> {
  const user = requireRole(request, 'merchant_owner');
  const merchant = merchantOf(user);
  const { reference } = await readJson(request, z.object({ reference: z.string().trim().min(4) }));
  const amount = balanceOf(merchant.id);
  if (amount <= 0) throw invalid('You have nothing to settle right now.');

  const db = getDb();
  const open = [...db.settlements.values()].some(
    (settlement) => settlement.merchantId === merchant.id && settlement.status === 'submitted',
  );
  if (open) throw invalid('Your last settlement is still being checked.');

  const settlement = {
    id: nextId('settlement'),
    merchantId: merchant.id,
    amount,
    reference,
    status: 'submitted' as const,
    createdAt: Date.now(),
    confirmedAt: null,
  };
  db.settlements.set(settlement.id, settlement);
  return ok({ id: settlement.id }, 201);
}

const profileBody = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(2),
  phone: z.string().trim().min(7),
});

export function getStoreSettings(request: Request): Response {
  const user = requireRole(request, 'merchant_owner');
  const merchant = merchantOf(user);
  return ok({
    name: merchant.name,
    description: merchant.description,
    phone: merchant.phone,
    branches: merchant.branches,
    staff: [...getDb().users.values()]
      .filter((entry) => entry.merchantId === merchant.id)
      .map((entry) => ({ id: entry.id, name: entry.name, email: entry.email, role: entry.role })),
  });
}

export async function updateStoreSettings(request: Request): Promise<Response> {
  const user = requireRole(request, 'merchant_owner');
  const merchant = merchantOf(user);
  Object.assign(merchant, await readJson(request, profileBody));
  return ok({ saved: true });
}

export { applySettlement };
