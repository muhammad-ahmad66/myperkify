import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import { claimPassSchema, claimSchema } from './schemas';
import type { Claim, CreateClaimInput } from './types';

export async function createClaim(input: CreateClaimInput): Promise<Claim> {
  const response = await api.post<ApiSuccess<unknown>>('/claims', input);
  return claimSchema.parse(response.data.data);
}

export async function fetchClaim(id: string): Promise<Claim> {
  const response = await api.get<ApiSuccess<unknown>>(`/claims/${id}`);
  return claimSchema.parse(response.data.data);
}

export async function fetchLiveClaim(dealSlug: string): Promise<Claim | null> {
  const response = await api.get<ApiSuccess<unknown>>('/claims/live', { params: { dealSlug } });
  const data = response.data.data;
  return data === null ? null : claimSchema.parse(data);
}

export async function fetchClaimPass(id: string): Promise<string> {
  const response = await api.get<ApiSuccess<unknown>>(`/claims/${id}/pass`);
  return claimPassSchema.parse(response.data.data).token;
}

export async function cancelClaim(id: string): Promise<void> {
  await api.delete(`/claims/${id}`);
}
