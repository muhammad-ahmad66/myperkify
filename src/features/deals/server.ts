import 'server-only';
import { z } from 'zod';
import { serverGet, serverGetWithMeta } from '@/lib/api/server';
import type { DealPage } from './api';
import { toQueryString } from './filters';
import { categorySchema, dealCardSchema, dealDetailSchema } from './schemas';
import type { Category, DealCard, DealDetail, DealFilters } from './types';

export async function getDeals(filters: DealFilters): Promise<DealCard[]> {
  return z.array(dealCardSchema).parse(await serverGet(`/deals?${toQueryString(filters)}`));
}

export async function getDealPage(filters: DealFilters): Promise<DealPage> {
  const { data, meta } = await serverGetWithMeta(`/deals?${toQueryString(filters)}`);
  return { deals: z.array(dealCardSchema).parse(data), total: meta?.total ?? 0 };
}

export async function getCategories(): Promise<Category[]> {
  return z.array(categorySchema).parse(await serverGet('/categories'));
}

export async function getDeal(slug: string): Promise<DealDetail> {
  return dealDetailSchema.parse(await serverGet(`/deals/${encodeURIComponent(slug)}`));
}
