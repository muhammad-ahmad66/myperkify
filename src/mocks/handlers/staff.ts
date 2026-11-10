import { cashierFormSchema } from '@/features/merchant/schemas';
import { API_ERROR_CODES } from '@/lib/api/types';
import { blankUser, getDb, nextId, type MockMerchant, type MockUser } from '../db';
import { HttpError, invalid, notFound, ok, readJson } from '../http';
import { requireRole } from '../session';

/** Mock default for D-10: a cashier has their own login, sees claims only, at one branch. */

function ownStore(request: Request): MockMerchant {
  const user = requireRole(request, 'merchant_owner');
  const merchant = getDb().merchants.get(user.merchantId ?? '');
  if (!merchant) throw notFound("We couldn't find your store.");
  return merchant;
}

function ownBranch(merchant: MockMerchant, branchId: string): void {
  if (!merchant.branches.some((branch) => branch.id === branchId)) {
    throw invalid('Choose one of your branches.', { branchId: 'Choose one of your branches.' });
  }
}

function ownCashier(merchant: MockMerchant, id: string): MockUser {
  const user = getDb().users.get(id);
  if (!user || user.merchantId !== merchant.id || user.role !== 'cashier') {
    throw notFound("We couldn't find that cashier.");
  }
  return user;
}

function toStaff(user: MockUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
  };
}

export async function addCashier(request: Request): Promise<Response> {
  const merchant = ownStore(request);
  const values = await readJson(request, cashierFormSchema);
  ownBranch(merchant, values.branchId);

  const db = getDb();
  if ([...db.users.values()].some((user) => user.email === values.email)) {
    const message = 'That email already has an account.';
    throw new HttpError(409, API_ERROR_CODES.emailTaken, message, { email: message });
  }

  const id = nextId('user');
  const cashier: MockUser = {
    ...blankUser(id),
    role: 'cashier',
    status: 'verified',
    name: values.name,
    email: values.email,
    merchantId: merchant.id,
    branchId: values.branchId,
  };
  db.users.set(id, cashier);
  return ok(toStaff(cashier), 201);
}

/** The email is the login, so it stays fixed. Name and branch can change. */
export async function updateCashier(request: Request, id: string): Promise<Response> {
  const merchant = ownStore(request);
  const cashier = ownCashier(merchant, id);
  const values = await readJson(request, cashierFormSchema);
  ownBranch(merchant, values.branchId);
  cashier.name = values.name;
  cashier.branchId = values.branchId;
  return ok(toStaff(cashier));
}

export function removeCashier(request: Request, id: string): Response {
  const merchant = ownStore(request);
  const cashier = ownCashier(merchant, id);
  getDb().users.delete(cashier.id);
  return ok({ removed: true });
}

export { toStaff };
