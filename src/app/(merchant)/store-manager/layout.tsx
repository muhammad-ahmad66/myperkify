import type { ReactNode } from 'react';
import { ApplicationStatus } from '@/features/merchant/components/ApplicationStatus';
import { MerchantShell } from '@/features/merchant/components/MerchantShell';
import { requireMerchant } from '@/features/session/server';

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  const viewer = await requireMerchant();
  const { status } = viewer.merchant;
  if (status === 'applied' || status === 'rejected') {
    return <ApplicationStatus viewer={viewer} />;
  }
  return <MerchantShell viewer={viewer}>{children}</MerchantShell>;
}
