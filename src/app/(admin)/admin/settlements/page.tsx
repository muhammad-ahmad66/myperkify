import type { Metadata } from 'next';
import { SettlementsView } from '@/features/admin/components/SettlementsView';

export const metadata: Metadata = { title: 'Settlements' };

export default function AdminSettlementsPage() {
  return <SettlementsView />;
}
