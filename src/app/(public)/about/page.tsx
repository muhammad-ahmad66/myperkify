import type { Metadata } from 'next';
import { AboutPage } from '@/features/marketing/components/AboutPage';

export const metadata: Metadata = { title: 'About' };

export default function Page() {
  return <AboutPage />;
}
