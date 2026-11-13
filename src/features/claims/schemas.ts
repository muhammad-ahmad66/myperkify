import { z } from 'zod';

export const claimSchema = z.object({
  id: z.string(),
  code: z.string().regex(/^\d{4}$/),
  status: z.enum(['pending', 'redeemed', 'expired', 'cancelled']),
  dealSlug: z.string(),
  brandName: z.string(),
  brandInitials: z.string(),
  brandColor: z.string(),
  branchName: z.string(),
  optionLabel: z.string(),
  amount: z.number().int(),
  saved: z.number().int(),
  /** The server decides expiry. The phone only displays what is left. */
  expiresAt: z.string(),
  serverNow: z.string(),
  transactionId: z.string().nullable(),
  orderId: z.string().nullable(),
  receiptEmail: z.string(),
});

export const claimPassSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  serverNow: z.string(),
});
