import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { DealExplorer } from '@/features/deals/components/DealExplorer';
import { HOME_DEAL_FILTERS } from '@/features/deals/constants';
import { getDeals } from '@/features/deals/server';
import { Hero } from '@/features/marketing/components/Hero';
import { Process } from '@/features/marketing/components/Process';
import { PROCESS_STEPS } from '@/features/marketing/content';
import { queryKeys } from '@/lib/query/keys';

export default async function HomePage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.deals.list(HOME_DEAL_FILTERS),
    queryFn: () => getDeals(HOME_DEAL_FILTERS),
  });

  return (
    <main id="top">
      <Hero />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DealExplorer />
      </HydrationBoundary>
      <Process steps={PROCESS_STEPS} />
    </main>
  );
}
