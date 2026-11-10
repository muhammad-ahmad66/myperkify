import type { Metadata } from 'next';
import { MerchantDeals } from '@/features/merchant/components/MerchantDeals';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Deals and products' };

export default async function MerchantDealsPage() {
  await requireOwner();
  return <MerchantDeals />;
}
