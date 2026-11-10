import type { Metadata } from 'next';
import { BusinessPage } from '@/features/marketing/components/BusinessPage';

export const metadata: Metadata = {
  title: 'For businesses',
  description: 'List your business on MyPerkify. Pay 5% only on completed orders.',
};

export default function Page() {
  return <BusinessPage />;
}
