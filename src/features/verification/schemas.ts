import { z } from 'zod';
import { CARD_MAX_BYTES, CARD_MIME_TYPES, VERIFICATION_CODE_LENGTH } from '@/lib/constants';
import { classifyEmail } from './lib/emailDomain';

export const NOT_LISTED_UNIVERSITY_ID = 'not-listed';

export const universitySchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  emailDomains: z.array(z.string()),
});

export const verificationMethodSchema = z.enum(['email', 'card']);

/** Trim first: z.email() rejects surrounding spaces. */
const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Enter a full email address, like name@university.edu.pk'));

export const accountSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    universityId: z
      .string()
      .min(1, 'Choose your university, or pick "My university isn\'t listed".'),
    method: verificationMethodSchema,
    email: emailField,
    acceptedTerms: z.boolean().refine(Boolean, 'Tick the box to continue.'),
  })
  .superRefine((values, context) => {
    if (values.method !== 'email') return;
    const kind = classifyEmail(values.email);
    if (kind === 'personal') {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message: "That's a personal email. Use your uni email, or choose Student card photo above.",
      });
    } else if (kind === 'other') {
      context.addIssue({
        code: 'custom',
        path: ['email'],
        message: "We don't recognise this domain. Choose Student card photo above instead.",
      });
    }
  });

export const verificationCodeSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`), 'Enter all six digits.'),
});

export const lockedEmailSchema = z.object({
  email: z.union([z.literal(''), emailField]),
});

/** Friendly check before upload. The server inspects the actual file again. */
export function validateCardFile(file: { type: string; size: number }): string | null {
  if (!(CARD_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a JPG or PNG photo of your card.';
  }
  if (file.size > CARD_MAX_BYTES) return 'That photo is over 5 MB. Try a smaller one.';
  return null;
}
