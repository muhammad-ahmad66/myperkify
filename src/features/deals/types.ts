import type { z } from 'zod';
import type {
  branchSchema,
  categorySchema,
  dealCardSchema,
  dealDetailSchema,
  dealOptionSchema,
  dealPricingSchema,
  dealSummarySchema,
} from './schemas';

export type DealMode = 'in_store' | 'online' | 'both';
export type ModeFilter = 'all' | 'in_store' | 'online';

export type DealSort = 'recommended' | 'price';

export type DealFilters = {
  category: string;
  mode: ModeFilter;
  sort: DealSort;
  q: string;
  limit: number;
};

export type DealPricing = z.infer<typeof dealPricingSchema>;
export type DealCard = z.infer<typeof dealCardSchema>;
export type DealSummary = z.infer<typeof dealSummarySchema>;
export type DealOption = z.infer<typeof dealOptionSchema>;
export type Branch = z.infer<typeof branchSchema>;
export type DealDetail = z.infer<typeof dealDetailSchema>;
export type Category = z.infer<typeof categorySchema>;
