import type { Metadata } from 'next';
import { DealForm } from '@/features/merchant/components/DealForm';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'New item' };

export default async function NewDealPage() {
  await requireOwner();
  return <DealForm />;
}
