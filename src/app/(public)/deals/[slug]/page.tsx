import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { DealDetailView } from '@/features/deals/components/DealDetailView';
import { getDeal } from '@/features/deals/server';
import { ApiError } from '@/lib/api/errors';
import { API_ERROR_CODES } from '@/lib/api/types';
import { queryKeys } from '@/lib/query/keys';

type DealPageProps = { params: Promise<{ slug: string }> };

const loadDeal = cache(async (slug: string) => {
  try {
    return await getDeal(slug);
  } catch (error) {
    if (error instanceof ApiError && error.code === API_ERROR_CODES.notFound) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  const deal = await loadDeal((await params).slug);
  return {
    title: deal.brand.name,
    description: `${deal.heading} at ${deal.brand.name} for verified students.`,
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const { slug } = await params;
  const deal = await loadDeal(slug);

  const queryClient = new QueryClient();
  queryClient.setQueryData(queryKeys.deals.detail(slug), deal);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DealDetailView slug={slug} />
    </HydrationBoundary>
  );
}
