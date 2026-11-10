import type { Metadata } from 'next';
import { OrderTracking } from '@/features/orders/components/OrderTracking';
import { requireStudent } from '@/features/session/server';

export const metadata: Metadata = { title: 'Your order' };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStudent();
  return <OrderTracking id={(await params).id} />;
}
