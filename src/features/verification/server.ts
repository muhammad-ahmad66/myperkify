import 'server-only';
import { z } from 'zod';
import { serverGet } from '@/lib/api/server';
import { universitySchema } from './schemas';
import type { University } from './types';

export async function getUniversities(): Promise<University[]> {
  return z.array(universitySchema).parse(await serverGet('/universities'));
}
