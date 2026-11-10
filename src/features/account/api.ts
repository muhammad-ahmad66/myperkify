import { z } from 'zod';
import { dealCardSchema } from '@/features/deals/schemas';
import type { DealCard } from '@/features/deals/types';
import type { Viewer } from '@/features/session/types';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { AccountSummary } from './types';

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const response = await api.get<ApiSuccess<AccountSummary>>('/account/summary');
  return response.data.data;
}

export async function fetchSavedDeals(): Promise<DealCard[]> {
  const response = await api.get<ApiSuccess<unknown>>('/account/saved');
  return z.array(dealCardSchema).parse(response.data.data);
}

export async function updateName(name: string): Promise<Viewer> {
  const response = await api.patch<ApiSuccess<Viewer>>('/account/profile', { name });
  return response.data.data;
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/account');
}
