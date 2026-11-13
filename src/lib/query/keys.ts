import type { DealFilters } from '@/features/deals/types';

export const queryKeys = {
  session: {
    viewer: () => ['session', 'viewer'] as const,
  },
  deals: {
    all: () => ['deals'] as const,
    list: (filters: DealFilters) => ['deals', 'list', filters] as const,
    page: (filters: DealFilters) => ['deals', 'page', filters] as const,
    categories: () => ['deals', 'categories'] as const,
    detail: (slug: string) => ['deals', 'detail', slug] as const,
    search: (query: string) => ['deals', 'search', query] as const,
  },
  claims: {
    detail: (id: string) => ['claims', 'detail', id] as const,
    live: (slug: string) => ['claims', 'live', slug] as const,
    pass: (id: string) => ['claims', 'pass', id] as const,
  },
  cart: {
    summary: () => ['cart', 'summary'] as const,
  },
  merchant: {
    all: () => ['merchant'] as const,
    board: () => ['merchant', 'board'] as const,
    overview: () => ['merchant', 'overview'] as const,
    ledger: () => ['merchant', 'ledger'] as const,
    orders: () => ['merchant', 'orders'] as const,
    deals: () => ['merchant', 'deals'] as const,
    deal: (id: string) => ['merchant', 'deals', id] as const,
    settings: () => ['merchant', 'settings'] as const,
  },
  admin: {
    all: () => ['admin'] as const,
    counts: () => ['admin', 'counts'] as const,
    verifications: () => ['admin', 'verifications'] as const,
    merchants: () => ['admin', 'merchants'] as const,
    settlements: () => ['admin', 'settlements'] as const,
  },
  orders: {
    all: () => ['orders'] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  account: {
    summary: () => ['account', 'summary'] as const,
    saved: () => ['account', 'saved'] as const,
  },
  stores: {
    detail: (slug: string) => ['stores', slug] as const,
  },
  verification: {
    universities: () => ['verification', 'universities'] as const,
  },
};
