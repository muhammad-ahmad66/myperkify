import type { Order, OrderStatus } from '@/features/orders/types';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { CashierBoard, Ledger, MerchantDeal, Overview, StoreSettings } from './types';
import type { BranchFormValues } from './schemas';

async function get<T>(path: string): Promise<T> {
  const response = await api.get<ApiSuccess<T>>(path);
  return response.data.data;
}

export const fetchBoard = () => get<CashierBoard>('/merchant/claims');
export const fetchOverview = () => get<Overview>('/merchant/overview');
export const fetchLedger = () => get<Ledger>('/merchant/ledger');
export const fetchMerchantOrders = () => get<Order[]>('/merchant/orders');
export const fetchMerchantDeals = () => get<MerchantDeal[]>('/merchant/deals');
export const fetchMerchantDeal = (id: string) => get<MerchantDeal>(`/merchant/deals/${id}`);
export const fetchStoreSettings = () => get<StoreSettings>('/merchant/settings');

export async function approveClaim(id: string): Promise<void> {
  await api.post(`/merchant/claims/${id}/approve`);
}

export async function updateOrderStatus(input: { id: string; status: OrderStatus }): Promise<void> {
  await api.post(`/merchant/orders/${input.id}/status`, { status: input.status });
}

export async function submitSettlement(reference: string): Promise<void> {
  await api.post('/merchant/settlements', { reference });
}

export type DealValues = Omit<MerchantDeal, 'id' | 'slug' | 'claims' | 'image'>;

export async function saveDeal(input: { id?: string; values: DealValues }): Promise<MerchantDeal> {
  const response = input.id
    ? await api.put<ApiSuccess<MerchantDeal>>(`/merchant/deals/${input.id}`, input.values)
    : await api.post<ApiSuccess<MerchantDeal>>('/merchant/deals', input.values);
  return response.data.data;
}

export async function saveStoreProfile(values: {
  name: string;
  description: string;
  phone: string;
}): Promise<void> {
  await api.put('/merchant/settings', values);
}

export async function saveBranch(input: { id?: string; values: BranchFormValues }): Promise<void> {
  if (input.id) await api.put(`/merchant/branches/${input.id}`, input.values);
  else await api.post('/merchant/branches', input.values);
}

export async function deleteBranch(id: string): Promise<void> {
  await api.delete(`/merchant/branches/${id}`);
}
