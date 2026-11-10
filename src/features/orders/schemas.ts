import { z } from 'zod';
import { mobileSchema } from '@/lib/validation';

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  phone: mobileSchema('Enter a mobile number the rider can call, like 300 1234567.'),
  address: z.string().trim().min(5, 'Enter your address, including your hostel or house number.'),
  city: z.string().trim().min(2, 'Enter your city.'),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
