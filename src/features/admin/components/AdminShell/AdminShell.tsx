'use client';

import { BadgeCheck, Receipt, Store } from 'lucide-react';
import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { AdminViewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import { useAdminCounts } from '../../hooks';

export function AdminShell({ viewer, children }: { viewer: AdminViewer; children: ReactNode }) {
  const { data: counts } = useAdminCounts();

  return (
    <DashboardShell
      title="MyPerkify admin"
      userName={viewer.name}
      nav={[
        {
          label: 'Verifications',
          href: ROUTES.adminVerifications,
          icon: BadgeCheck,
          count: counts?.verifications,
        },
        {
          label: 'Merchants',
          href: ROUTES.adminMerchants,
          icon: Store,
          count: counts?.merchants,
        },
        {
          label: 'Settlements',
          href: ROUTES.adminSettlements,
          icon: Receipt,
          count: counts?.settlements,
        },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
