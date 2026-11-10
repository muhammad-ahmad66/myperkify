import type { z } from 'zod';
import type { claimSchema } from './schemas';

export type ClaimStatus = 'pending' | 'redeemed' | 'expired' | 'cancelled';
export type Claim = z.infer<typeof claimSchema>;

export type CreateClaimInput = {
  dealId: string;
  optionId: string;
  branchId: string;
};
