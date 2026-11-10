import type { Metadata } from 'next';
import { CheckoutView } from '@/features/orders/components/CheckoutView';
import { requireVerifiedStudent } from '@/features/session/server';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  await requireVerifiedStudent();
  return <CheckoutView />;
}
