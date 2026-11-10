import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type {
  AdminCounts,
  AdminMerchant,
  AdminSettlements,
  Decision,
  PendingVerification,
} from './types';

async function get<T>(path: string): Promise<T> {
  const response = await api.get<ApiSuccess<T>>(path);
  return response.data.data;
}

export const fetchCounts = () => get<AdminCounts>('/admin/counts');
export const fetchVerifications = () => get<PendingVerification[]>('/admin/verifications');
export const fetchAdminMerchants = () => get<AdminMerchant[]>('/admin/merchants');
export const fetchAdminSettlements = () => get<AdminSettlements>('/admin/settlements');

export async function decideVerification({ id, ...body }: Decision): Promise<void> {
  await api.post(`/admin/verifications/${id}`, body);
}

export async function decideMerchant({ id, ...body }: Decision): Promise<void> {
  await api.post(`/admin/merchants/${id}`, body);
}

export async function decideSettlement(input: {
  id: string;
  decision: 'confirm' | 'reject';
}): Promise<void> {
  await api.post(`/admin/settlements/${input.id}`, { decision: input.decision });
}
