'use client';

import { Button } from '@/components/ui/Button';
import { StateMessage } from '@/components/ui/StateMessage';
import { Wrap } from '@/components/ui/Wrap';
import { VoucherDialog } from '@/features/claims/components/VoucherDialog';
import { useDeal } from '../../hooks';
import type { DealDetail } from '../../types';
import { BranchList } from '../BranchList';
import { ClaimPanel } from '../ClaimPanel';
import { DealCover } from '../DealCover';
import { DealIntro } from '../DealIntro';
import { FinePrint } from '../FinePrint';
import { HowToUse } from '../HowToUse';
import { MobileClaimBar } from '../MobileClaimBar';
import { RelatedDeals } from '../RelatedDeals';
import { DealBreadcrumb } from './DealBreadcrumb';
import { DealDetailSkeleton } from './DealDetailSkeleton';
import styles from './DealDetailView.module.css';
import { useClaimActions } from './useClaimActions';
import { useClaimSelection } from './useClaimSelection';

function DealContent({ deal }: { deal: DealDetail }) {
  const selection = useClaimSelection(deal);
  const verified = deal.pricing.access === 'unlocked';
  const actions = useClaimActions(deal, selection, verified);

  function chooseBranch(branchId: string) {
    selection.setBranchId(branchId);
    selection.setMode('store');
  }

  return (
    <main>
      <Wrap>
        <DealBreadcrumb deal={deal} />
        <div className={styles.grid}>
          <div className={styles.lead}>
            <DealCover deal={deal} />
            <DealIntro deal={deal} />
          </div>
          <ClaimPanel deal={deal} selection={selection} actions={actions} />
          <div className={styles.details}>
            <HowToUse groups={deal.howTo} mode={selection.mode} />
            <BranchList deal={deal} selectedId={selection.branch?.id} onSelect={chooseBranch} />
            <FinePrint deal={deal} />
          </div>
        </div>
        <RelatedDeals deal={deal} />
      </Wrap>
      <MobileClaimBar deal={deal} selection={selection} actions={actions} />
      <VoucherDialog claim={actions.voucher} onClose={actions.closeVoucher} />
    </main>
  );
}

export function DealDetailView({ slug }: { slug: string }) {
  const { data: deal, isPending, isFetching, refetch } = useDeal(slug);

  if (isPending) return <DealDetailSkeleton />;
  if (!deal) {
    return (
      <main>
        <Wrap className={styles.error}>
          <StateMessage
            role="alert"
            action={
              <Button variant="ghost" size="sm" loading={isFetching} onClick={() => refetch()}>
                Try again
              </Button>
            }
          >
            We couldn&apos;t load this deal. Check your connection and try again.
          </StateMessage>
        </Wrap>
      </main>
    );
  }

  // Remount when access changes, so selections always match the options on screen.
  return <DealContent key={`${deal.id}-${deal.pricing.access}`} deal={deal} />;
}
