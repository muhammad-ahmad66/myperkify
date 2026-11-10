import type { Metadata } from 'next';
import { StoreSettingsView } from '@/features/merchant/components/StoreSettingsView';
import { requireOwner } from '@/features/session/server';

export const metadata: Metadata = { title: 'Store settings' };

export default async function SettingsPage() {
  await requireOwner();
  return <StoreSettingsView />;
}
