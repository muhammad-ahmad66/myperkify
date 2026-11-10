import type { Metadata } from 'next';
import { LedgerView } from '@/features/merchant/components/LedgerView';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Commission ledger' };

export default async function LedgerPage() {
  await requireOwner();
  return <LedgerView />;
}
