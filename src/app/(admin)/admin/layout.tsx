import type { ReactNode } from 'react';
import { AdminShell } from '@/features/admin/components/AdminShell';
import { requireAdmin } from '@/features/session/server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const viewer = await requireAdmin();
  return <AdminShell viewer={viewer}>{children}</AdminShell>;
}
