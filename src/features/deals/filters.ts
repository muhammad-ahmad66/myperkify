import type { DealFilters, DealSort, ModeFilter } from './types';

const MODES: ModeFilter[] = ['all', 'in_store', 'online'];
const SORTS: DealSort[] = ['recommended', 'price'];

type ParamReader = { get: (key: string) => string | null };

/** One reading of the URL, shared by server and client so they use the same query key. */
export function parseFilters(params: ParamReader, limit: number): DealFilters {
  const mode = params.get('mode');
  const sort = params.get('sort');
  return {
    category: params.get('category') ?? 'all',
    mode: MODES.find((entry) => entry === mode) ?? 'all',
    sort: SORTS.find((entry) => entry === sort) ?? 'recommended',
    q: params.get('q') ?? '',
    limit,
  };
}

export function toQueryString(filters: DealFilters): string {
  return new URLSearchParams({
    category: filters.category,
    mode: filters.mode,
    sort: filters.sort,
    q: filters.q,
    limit: String(filters.limit),
  }).toString();
}
