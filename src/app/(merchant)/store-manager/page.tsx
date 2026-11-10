import type { Metadata } from 'next';
import { MerchantOverview } from '@/features/merchant/components/MerchantOverview';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Store overview' };

export default async function MerchantOverviewPage() {
  await requireOwner();
  return <MerchantOverview />;
}
