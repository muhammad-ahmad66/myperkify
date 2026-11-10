export type AccountSummary = {
  totalSaved: number;
  completedOrders: number;
  savedDeals: number;
  liveClaim: { dealSlug: string; brand: string } | null;
};
