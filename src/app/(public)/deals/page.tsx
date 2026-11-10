import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DealDirectory } from '@/features/deals/components/DealDirectory';
import { DIRECTORY_PAGE_SIZE } from '@/features/deals/constants';
import { parseFilters } from '@/features/deals/filters';
import { getCategories, getDealPage } from '@/features/deals/server';
import { queryKeys } from '@/lib/query/keys';

export const metadata: Metadata = {
  title: 'Student deals',
  description: 'Verified student discounts at cafés, bookshops, gyms and online stores.',
};

type DealsPageProps = { searchParams: Promise<Record<string, string | undefined>> };

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const filters = parseFilters({ get: (key) => params[key] ?? null }, DIRECTORY_PAGE_SIZE);

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.deals.page(filters),
      queryFn: () => getDealPage(filters),
    }),
    queryClient.prefetchQuery({ queryKey: queryKeys.deals.categories(), queryFn: getCategories }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DealDirectory />
      </Suspense>
    </HydrationBoundary>
  );
}
