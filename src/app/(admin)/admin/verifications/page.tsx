import type { Metadata } from 'next';
import { VerificationQueue } from '@/features/admin/components/VerificationQueue';

export const metadata: Metadata = { title: 'Verifications' };

export default function VerificationsPage() {
  return <VerificationQueue />;
}
