'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useViewer } from '@/features/session/hooks';
import { queryKeys } from '@/lib/query/keys';
import { ROUTES } from '@/lib/routes';
import {
  fetchCategories,
  fetchDeal,
  fetchDealPage,
  fetchDeals,
  reportDeal,
  searchDeals,
  setDealSaved,
} from './api';
import { parseFilters } from './filters';
import type { DealFilters } from './types';

const FILTER_DEFAULTS = ['all', 'recommended', ''];

/** Filters live in the URL so a filtered view can be shared. */
export function useDealFilters(limit: number) {
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams, limit), [searchParams, limit]);

  const setFilters = useCallback((next: Partial<Omit<DealFilters, 'limit'>>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(next).forEach(([key, value]) => {
      if (FILTER_DEFAULTS.includes(value)) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    const { pathname, hash } = window.location;
    window.history.replaceState(null, '', `${pathname}${query ? `?${query}` : ''}${hash}`);
  }, []);

  return { filters, setFilters };
}

export function useDeals(filters: DealFilters) {
  return useQuery({
    queryKey: queryKeys.deals.list(filters),
    queryFn: () => fetchDeals(filters),
    placeholderData: keepPreviousData,
  });
}

export function useDealPage(filters: DealFilters) {
  return useQuery({
    queryKey: queryKeys.deals.page(filters),
    queryFn: () => fetchDealPage(filters),
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.deals.categories(),
    queryFn: fetchCategories,
    meta: { background: true },
  });
}

export function useDeal(slug: string) {
  return useQuery({ queryKey: queryKeys.deals.detail(slug), queryFn: () => fetchDeal(slug) });
}

export function useDealSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.deals.search(query),
    queryFn: () => searchDeals(query),
    enabled,
    placeholderData: keepPreviousData,
    meta: { background: true },
  });
}

type SavedPatch = { dealId: string; saved: boolean };

function applySaved(cached: unknown, { dealId, saved }: SavedPatch): unknown {
  const patch = (item: unknown) =>
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'isSaved' in item &&
    item.id === dealId
      ? { ...item, isSaved: saved }
      : item;
  return Array.isArray(cached) ? cached.map(patch) : patch(cached);
}

function snapshotDeals(queryClient: QueryClient) {
  return queryClient.getQueriesData({ queryKey: queryKeys.deals.all() });
}

/** The heart responds at once, and goes back if the server refuses. */
export function useToggleSave() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { viewer } = useViewer();

  const mutation = useMutation({
    mutationFn: setDealSaved,
    meta: { retryable: true },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.deals.all() });
      const snapshot = snapshotDeals(queryClient);
      queryClient.setQueriesData({ queryKey: queryKeys.deals.all() }, (cached) =>
        applySaved(cached, patch),
      );
      return { snapshot };
    },
    onError: (_error, _patch, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (_data, { saved }) => {
      toast.success(saved ? 'Saved to your deals' : 'Removed from saved deals');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.deals.all() });
    },
  });

  return {
    isPending: mutation.isPending,
    toggle: (input: SavedPatch) => {
      if (mutation.isPending) return;
      if (viewer.kind === 'visitor') {
        toast('Create a free account to save deals', {
          action: { label: 'Get verified', onClick: () => router.push(ROUTES.getVerified) },
        });
        return;
      }
      mutation.mutate(input);
    },
  };
}

export function useReportDeal() {
  return useMutation({
    mutationFn: reportDeal,
    meta: { retryable: true },
    onSuccess: () => {
      toast.success('Thanks. Our team will check this deal.');
    },
  });
}
