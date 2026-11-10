import type { DealFilters } from './types';

/** The homepage shows up to eight deals (F-201). */
export const HOME_DEAL_LIMIT = 8;
export const DIRECTORY_PAGE_SIZE = 8;

export const HOME_DEAL_FILTERS: DealFilters = {
  category: 'all',
  mode: 'all',
  sort: 'recommended',
  q: '',
  limit: HOME_DEAL_LIMIT,
};
