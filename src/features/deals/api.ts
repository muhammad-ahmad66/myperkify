import { z } from 'zod';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import { categorySchema, dealCardSchema, dealDetailSchema, dealSummarySchema } from './schemas';
import type { Category, DealCard, DealDetail, DealFilters, DealSummary } from './types';

export async function fetchDeals(filters: DealFilters): Promise<DealCard[]> {
  const response = await api.get<ApiSuccess<unknown>>('/deals', { params: filters });
  return z.array(dealCardSchema).parse(response.data.data);
}

export type DealPage = { deals: DealCard[]; total: number };

export async function fetchDealPage(filters: DealFilters): Promise<DealPage> {
  const response = await api.get<ApiSuccess<unknown>>('/deals', { params: filters });
  return {
    deals: z.array(dealCardSchema).parse(response.data.data),
    total: response.data.meta?.total ?? 0,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<ApiSuccess<unknown>>('/categories');
  return z.array(categorySchema).parse(response.data.data);
}

export async function fetchDeal(slug: string): Promise<DealDetail> {
  const response = await api.get<ApiSuccess<unknown>>(`/deals/${slug}`);
  return dealDetailSchema.parse(response.data.data);
}

export async function searchDeals(query: string): Promise<DealSummary[]> {
  const response = await api.get<ApiSuccess<unknown>>('/deals/search', { params: { q: query } });
  return z.array(dealSummarySchema).parse(response.data.data);
}

export async function setDealSaved(input: { dealId: string; saved: boolean }): Promise<void> {
  await api.put(`/saved-deals/${input.dealId}`, { saved: input.saved });
}

export async function reportDeal(dealId: string): Promise<void> {
  await api.post('/reports', { dealId });
}
