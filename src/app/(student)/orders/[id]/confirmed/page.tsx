import type { Metadata } from 'next';
import { OrderConfirmed } from '@/features/orders/components/OrderConfirmed';
import { requireVerifiedStudent } from '@/features/session/server';

export const metadata: Metadata = { title: 'Order placed' };

export default async function OrderConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  await requireVerifiedStudent();
  return <OrderConfirmed id={(await params).id} />;
}
