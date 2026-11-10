'use client';

import { ClipboardList, LayoutDashboard, Receipt, Settings, Tag, Ticket } from 'lucide-react';
import type { ReactNode } from 'react';
import { DashboardShell, type DashboardNavItem } from '@/components/layout/DashboardShell';
import type { MerchantViewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import { useCashierBoard } from '../../hooks';

export function MerchantShell({
  viewer,
  children,
}: {
  viewer: MerchantViewer;
  children: ReactNode;
}) {
  const { data: board } = useCashierBoard();
  const claims: DashboardNavItem = {
    label: 'Claims',
    href: ROUTES.merchantClaims,
    icon: Ticket,
    count: board?.pending.length,
  };
  const nav: DashboardNavItem[] =
    viewer.role === 'cashier'
      ? [claims]
      : [
          { label: 'Overview', href: ROUTES.merchant, icon: LayoutDashboard, exact: true },
          claims,
          { label: 'Deals and products', href: ROUTES.merchantDeals, icon: Tag },
          { label: 'Orders', href: ROUTES.merchantOrders, icon: ClipboardList },
          { label: 'Ledger', href: ROUTES.merchantLedger, icon: Receipt },
          { label: 'Settings', href: ROUTES.merchantSettings, icon: Settings },
        ];

  return (
    <DashboardShell title={viewer.merchant.name} userName={viewer.name} nav={nav}>
      {children}
    </DashboardShell>
  );
}
