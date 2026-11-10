import { z } from 'zod';
import { emailSchema, mobileSchema } from '@/lib/validation';

export const branchSchema = z.object({
  name: z.string().trim().min(2, 'Name this branch, like Gulberg III.'),
  address: z.string().trim().min(8, 'Enter the full street address.'),
  city: z.string().min(1, 'Choose a city.'),
});

export type BranchValues = z.infer<typeof branchSchema>;

const applicationBase = z.object({
  // Your business
  tradingName: z.string().trim().min(2, 'Enter the name students will see.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  redemption: z.enum(['in_store', 'online', 'both']),

  // Branches
  branches: z.array(branchSchema),

  // Contact
  ownerName: z.string().trim().min(2, 'Enter your full name.'),
  email: emailSchema('Enter a full email address, like name@business.pk.'),
  phone: mobileSchema(),

  // Agreement
  acceptedCommission: z.boolean().refine(Boolean, 'Tick the box to continue.'),
  acceptedTerms: z.boolean().refine(Boolean, 'Tick the box to continue.'),
});

type ApplicationBase = z.infer<typeof applicationBase>;

/** Rules that depend on other answers. */
function refineApplication(values: ApplicationBase, context: z.RefinementCtx) {
  if (values.redemption !== 'online' && values.branches.length === 0) {
    context.addIssue({ code: 'custom', path: ['branches'], message: 'Add at least one branch.' });
  }
}

/** What the server validates. The proof file arrives separately and is checked by its bytes. */
export const applicationDataSchema = applicationBase.superRefine(refineApplication);
export type ApplicationData = z.infer<typeof applicationDataSchema>;

export const applicationFormSchema = applicationBase
  .extend({
    proof: z
      .custom<File | null>()
      .refine((file) => Boolean(file), 'Upload your document to continue.'),
  })
  .superRefine(refineApplication);

export type ApplicationValues = z.infer<typeof applicationFormSchema>;

export const BLANK_BRANCH: BranchValues = {
  name: '',
  address: '',
  city: '',
};

export const BLANK_APPLICATION: ApplicationValues = {
  tradingName: '',
  categoryId: '',
  redemption: 'in_store',
  branches: [BLANK_BRANCH],
  ownerName: '',
  email: '',
  phone: '',
  proof: null,
  acceptedCommission: false,
  acceptedTerms: false,
};
