import type { z } from 'zod';
import type { accountSchema, universitySchema } from './schemas';

export type University = z.infer<typeof universitySchema>;
export type AccountValues = z.infer<typeof accountSchema>;

export type SignupStep = 'account' | 'code' | 'card' | 'pending' | 'rejected' | 'done';
