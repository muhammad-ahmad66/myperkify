import type { ClaimStatus } from '@/features/claims/types';
import type { VerificationMethod, VerificationStatus } from '@/features/session/types';
import { DEALS, type SeedBranch, type SeedDeal } from './seed/deals';
import { seedActivity, seedMerchants, seedStaff } from './seed/activity';

export type MockRole = 'student' | 'merchant_owner' | 'cashier' | 'admin';

export type CartLine = { id: string; dealId: string; optionId: string; quantity: number };

export type MockUser = {
  id: string;
  role: MockRole;
  name: string;
  email: string;
  universityId: string;
  status: VerificationStatus;
  method: VerificationMethod | null;
  methodLabel: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  verificationCode: string | null;
  saved: Set<string>;
  cart: CartLine[];
  merchantId: string | null;
  /** A cashier belongs to one branch. Owners see every branch. Mock default for D-10 and D-12. */
  branchId: string | null;
};

export type MockClaim = {
  id: string;
  code: string;
  userId: string;
  dealId: string;
  optionId: string;
  branchId: string;
  status: ClaimStatus;
  expiresAt: number;
  transactionId: string | null;
  orderId: string | null;
  approvedAt: number | null;
  createdAt: number;
};

export type MerchantStatus = 'applied' | 'active' | 'on_hold' | 'suspended' | 'rejected';

export type MockMerchant = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  color: string;
  categoryId: string;
  description: string;
  status: MerchantStatus;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  branches: SeedBranch[];
  branchesNote: string;
  rejectionReason: string | null;
  createdAt: number;
};

export type OrderStatus = 'placed' | 'processing' | 'dispatched' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash_counter' | 'cod' | 'bank_transfer';

export type MockOrderItem = {
  dealId: string;
  title: string;
  regularPrice: number;
  studentPrice: number;
  quantity: number;
};

export type MockOrder = {
  id: string;
  number: string;
  studentId: string;
  studentName: string;
  studentUniversity: string;
  merchantId: string;
  source: 'in_store' | 'online';
  claimId: string | null;
  items: MockOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryAddress: string | null;
  branchName: string | null;
  checkoutId: string | null;
  createdAt: number;
  completedAt: number | null;
};

export type MockLedgerEntry = {
  id: string;
  merchantId: string;
  orderId: string | null;
  orderNumber: string | null;
  type: 'commission' | 'settlement' | 'adjustment';
  /** Positive adds to what the merchant owes. Negative reduces it. */
  amount: number;
  saleValue: number | null;
  rateSnapshot: number | null;
  createdAt: number;
};

export type MockSettlement = {
  id: string;
  merchantId: string;
  amount: number;
  reference: string;
  status: 'submitted' | 'confirmed' | 'rejected';
  createdAt: number;
  confirmedAt: number | null;
};

export type NetworkMode = 'normal' | 'slow' | 'failing';

export type MockDb = {
  users: Map<string, MockUser>;
  claims: Map<string, MockClaim>;
  merchants: Map<string, MockMerchant>;
  orders: Map<string, MockOrder>;
  ledger: MockLedgerEntry[];
  settlements: Map<string, MockSettlement>;
  deals: SeedDeal[];
  reports: { userId: string | null; dealId: string }[];
  settings: { commissionRate: number; threshold: number };
  sequence: number;
  network: NetworkMode;
  lastCode: string | null;
};

declare global {
  // Survives hot reloads in development.
  var __mockDb: MockDb | undefined;
}

function createDb(): MockDb {
  const db: MockDb = {
    users: new Map(),
    claims: new Map(),
    merchants: new Map(),
    orders: new Map(),
    ledger: [],
    settlements: new Map(),
    deals: structuredClone(DEALS),
    reports: [],
    settings: { commissionRate: 0.05, threshold: 2000 },
    sequence: 0,
    network: 'normal',
    lastCode: null,
  };
  seedMerchants(db);
  seedStaff(db);
  seedActivity(db);
  return db;
}

export function getDb(): MockDb {
  // The version check replaces a database left in memory by an older shape during hot reload.
  if (!globalThis.__mockDb?.merchants) globalThis.__mockDb = createDb();
  return globalThis.__mockDb;
}

export function resetDb(): void {
  globalThis.__mockDb = createDb();
}

export function nextId(prefix: string): string {
  const db = getDb();
  db.sequence += 1;
  return `${prefix}_${db.sequence}`;
}

export function allDeals(): SeedDeal[] {
  return getDb().deals;
}

/** What the public can see. Drafts, ended deals and unapproved shops stay hidden. */
export function liveDeals(): SeedDeal[] {
  const db = getDb();
  return db.deals.filter((deal) => {
    const status = db.merchants.get(deal.merchantId)?.status;
    return deal.status === 'live' && (status === 'active' || status === 'on_hold');
  });
}

export function blankUser(id: string): MockUser {
  return {
    id,
    role: 'student',
    name: '',
    email: '',
    universityId: '',
    status: 'unverified',
    method: null,
    methodLabel: null,
    rejectionReason: null,
    submittedAt: null,
    verificationCode: null,
    saved: new Set(),
    cart: [],
    merchantId: null,
    branchId: null,
  };
}
