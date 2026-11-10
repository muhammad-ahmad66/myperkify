import type { Metadata } from 'next';
import { CartView } from '@/features/cart/components/CartView';
import { requireVerifiedStudent } from '@/features/session/server';

export const metadata: Metadata = { title: 'Your cart' };

export default async function CartPage() {
  await requireVerifiedStudent();
  return <CartView />;
}
