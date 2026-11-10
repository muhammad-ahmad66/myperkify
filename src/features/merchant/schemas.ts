import { z } from 'zod';
import { emailSchema, mobileSchema } from '@/lib/validation';

export const dealFormSchema = z
  .object({
    type: z.enum(['in_store', 'online']),
    title: z.string().trim().min(3, 'Give the deal a short title.'),
    description: z.string().trim().min(10, 'Say what students get, in a sentence or two.'),
    categoryId: z.string().min(1, 'Choose a category.'),
    stampOffer: z
      .string()
      .trim()
      .min(1, 'Enter the offer, like 25%.')
      .max(8, 'Keep it to 8 characters.'),
    regularPrice: z.number('Enter the regular price.').int().positive('Enter the regular price.'),
    studentPrice: z.number('Enter the student price.').int().positive('Enter the student price.'),
    terms: z.string().trim(),
    status: z.enum(['draft', 'live', 'ended']),
  })
  .refine((deal) => deal.studentPrice < deal.regularPrice, {
    path: ['studentPrice'],
    message: 'Student price must be below the regular price.',
  });

export const settlementSchema = z.object({
  reference: z.string().trim().min(4, 'Enter the reference from your transfer.'),
});

export const storeProfileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your store name.'),
  description: z.string().trim().min(2, 'Add a short description.'),
  phone: mobileSchema(),
});

export const branchFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name this branch, like Gulberg III.'),
    city: z.string().min(1, 'Choose a city.'),
    address: z.string().trim().min(8, 'Enter the full street address.'),
    opensAt: z.string().min(1, 'Choose an opening time.'),
    closesAt: z.string().min(1, 'Choose a closing time.'),
  })
  .refine((branch) => branch.opensAt !== branch.closesAt, {
    path: ['closesAt'],
    message: 'Closing time must differ from opening time.',
  });

export type BranchFormValues = z.infer<typeof branchFormSchema>;

export const cashierFormSchema = z.object({
  name: z.string().trim().min(2, 'Enter their full name.'),
  email: emailSchema('Enter a full email address, like hamza@business.pk.'),
  branchId: z.string().min(1, 'Choose a branch.'),
});

export type CashierFormValues = z.infer<typeof cashierFormSchema>;
