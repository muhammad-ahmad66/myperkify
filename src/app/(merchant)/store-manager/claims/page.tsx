import type { Metadata } from 'next';
import { CashierBoard } from '@/features/merchant/components/CashierBoard';

export const metadata: Metadata = { title: 'Claims' };

export default function ClaimsPage() {
  return <CashierBoard />;
}
