export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type VerificationMethod = 'email' | 'card';

export type StudentViewer = {
  kind: 'student';
  id: string;
  name: string;
  email: string;
  university: string | null;
  verification: {
    status: VerificationStatus;
    method: VerificationMethod | null;
    /** Shown on the Verified card, for example "via nu.edu.pk". */
    methodLabel: string | null;
    /** The reviewer's note when a card was rejected. */
    rejectionReason: string | null;
    submittedAt: string | null;
  };
};

export type MerchantViewer = {
  kind: 'merchant';
  id: string;
  name: string;
  email: string;
  role: 'merchant_owner' | 'cashier';
  merchant: {
    id: string;
    name: string;
    status: 'applied' | 'active' | 'on_hold' | 'suspended' | 'rejected';
    rejectionReason: string | null;
  };
};

export type AdminViewer = { kind: 'admin'; id: string; name: string; email: string };

export type Viewer = { kind: 'visitor' } | StudentViewer | MerchantViewer | AdminViewer;

export function isVerified(viewer: Viewer): boolean {
  return viewer.kind === 'student' && viewer.verification.status === 'verified';
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
