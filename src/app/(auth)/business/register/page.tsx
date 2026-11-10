import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { RegisterFlow } from '@/features/business/components/RegisterFlow';
import { getCategories } from '@/features/deals/server';
import { queryKeys } from '@/lib/query/keys';

export const metadata: Metadata = {
  title: 'List your business',
  description: 'Apply to list your business on MyPerkify. Pay 5% only on completed orders.',
};

export default async function RegisterPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.deals.categories(),
    queryFn: getCategories,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RegisterFlow />
    </HydrationBoundary>
  );
}
