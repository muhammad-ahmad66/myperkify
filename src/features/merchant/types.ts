import type { MerchantViewer } from '@/features/session/types';

export type PendingClaim = {
  id: string;
  code: string;
  studentName: string;
  university: string;
  item: string;
  branchName: string;
  amount: number;
  expiresAt: string;
  serverNow: string;
};

export type CompletedClaim = {
  id: string;
  studentName: string;
  university: string;
  approvedAt: string;
  amount: number;
};

export type CashierBoard = { pending: PendingClaim[]; completedToday: CompletedClaim[] };

export type MerchantStatus = MerchantViewer['merchant']['status'];

export type Overview = {
  pendingClaims: number;
  newOrders: number;
  salesToday: number;
  claimsToday: number;
  balance: number;
  threshold: number;
  status: MerchantStatus;
};

export type LedgerEntry = {
  id: string;
  type: 'commission' | 'settlement' | 'adjustment';
  orderNumber: string | null;
  saleValue: number | null;
  amount: number;
  createdAt: string;
};

export type Settlement = {
  id: string;
  amount: number;
  reference: string;
  status: 'submitted' | 'confirmed' | 'rejected';
  createdAt: string;
};

export type Ledger = {
  balance: number;
  threshold: number;
  status: MerchantStatus;
  commissionRate: number;
  entries: LedgerEntry[];
  settlements: Settlement[];
};

export type MerchantDeal = {
  id: string;
  slug: string;
  title: string;
  type: 'in_store' | 'online';
  description: string;
  categoryId: string;
  stampOffer: string;
  regularPrice: number;
  studentPrice: number;
  terms: string;
  status: 'draft' | 'live' | 'ended';
  claims: number;
  image: string | null;
};

export type StoreBranch = {
  id: string;
  name: string;
  city: string;
  address: string;
  opensAt: string;
  closesAt: string;
  statusLabel: string;
  isOpen: boolean;
};

export type StoreSettings = {
  name: string;
  description: string;
  phone: string;
  branches: StoreBranch[];
  staff: StaffMember[];
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: 'merchant_owner' | 'cashier';
  branchId: string | null;
};
