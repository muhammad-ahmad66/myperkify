import type { Branch, DealCard } from '@/features/deals/types';

export type Store = {
  slug: string;
  name: string;
  initials: string;
  color: string;
  description: string;
  deals: DealCard[];
  branches: Branch[];
};
