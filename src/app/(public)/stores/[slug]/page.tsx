import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { StoreView } from '@/features/stores/components/StoreView';
import { getStore } from '@/features/stores/server';
import { ApiError } from '@/lib/api/errors';
import { API_ERROR_CODES } from '@/lib/api/types';

type StorePageProps = { params: Promise<{ slug: string }> };

const loadStore = cache(async (slug: string) => {
  try {
    return await getStore(slug);
  } catch (error) {
    if (error instanceof ApiError && error.code === API_ERROR_CODES.notFound) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const store = await loadStore((await params).slug);
  return { title: store.name, description: `Student deals at ${store.name}.` };
}

export default async function StorePage({ params }: StorePageProps) {
  return <StoreView store={await loadStore((await params).slug)} />;
}
