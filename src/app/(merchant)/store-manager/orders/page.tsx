import type { Metadata } from 'next';
import { MerchantOrders } from '@/features/merchant/components/MerchantOrders';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Orders' };

export default async function MerchantOrdersPage() {
  await requireOwner();
  return <MerchantOrders />;
}
