import type { Metadata } from 'next';
import { DealFormLoader } from '@/features/merchant/components/DealForm';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Edit item' };

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  return <DealFormLoader id={(await params).id} />;
}
