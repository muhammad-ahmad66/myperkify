import type { Metadata } from 'next';
import { AccountView } from '@/features/account/components/AccountView';
import { requireStudent } from '@/features/session/server';

export const metadata: Metadata = { title: 'Your account' };

export default async function AccountPage() {
  await requireStudent();
  return <AccountView />;
}
