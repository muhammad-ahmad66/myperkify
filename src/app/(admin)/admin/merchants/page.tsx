import type { Metadata } from 'next';
import { MerchantApprovals } from '@/features/admin/components/MerchantApprovals';

export const metadata: Metadata = { title: 'Merchants' };

export default function AdminMerchantsPage() {
  return <MerchantApprovals />;
}
