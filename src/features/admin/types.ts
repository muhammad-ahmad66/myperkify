export type PendingVerification = {
  id: string;
  name: string;
  email: string;
  university: string;
  submittedAt: string | null;
};

export type AdminMerchant = {
  id: string;
  name: string;
  initials: string;
  color: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  branchesNote: string;
  status: 'applied' | 'active' | 'on_hold' | 'suspended' | 'rejected';
  balance: number;
};

export type AdminSettlements = {
  settlements: {
    id: string;
    merchantName: string;
    amount: number;
    reference: string;
    status: 'submitted' | 'confirmed' | 'rejected';
    createdAt: string;
  }[];
  balances: { id: string; name: string; balance: number; status: AdminMerchant['status'] }[];
  threshold: number;
};

export type AdminCounts = { verifications: number; merchants: number; settlements: number };

export type Decision = { id: string; decision: 'approve' | 'reject'; reason?: string };
