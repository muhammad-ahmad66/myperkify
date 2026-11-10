'use client';

import { Store, Truck } from 'lucide-react';
import { Segmented } from '@/components/ui/Segmented';
import type { DealDetail } from '../../types';
import type { ClaimActions } from '../DealDetailView/useClaimActions';
import type { ClaimMode, ClaimSelection } from '../DealDetailView/useClaimSelection';
import { DeliveryBody } from './DeliveryBody';
import { LockedBox } from './LockedBox';
import { OptionList } from './OptionList';
import { StoreBody } from './StoreBody';
import styles from './ClaimPanel.module.css';

const MODE_OPTIONS: { value: ClaimMode; label: string; icon: typeof Store }[] = [
  { value: 'store', label: 'In store', icon: Store },
  { value: 'online', label: 'Delivery', icon: Truck },
];

type ClaimPanelProps = {
  deal: DealDetail;
  selection: ClaimSelection;
  actions: ClaimActions;
};

export function ClaimPanel({ deal, selection, actions }: ClaimPanelProps) {
  const locked = deal.pricing.access === 'locked';

  return (
    <aside id="claim" className={styles.panel} aria-label="Claim this deal">
      <div className={styles.top}>
        {deal.mode === 'both' && (
          <Segmented
            label="How do you want to use it?"
            value={selection.mode}
            options={MODE_OPTIONS}
            onChange={selection.setMode}
            block
          />
        )}
        <OptionList deal={deal} selection={selection} />
      </div>

      {locked && <LockedBox deal={deal} />}
      {!locked && deal.isOnHold && (
        <p className={styles.unavailable} role="status">
          This deal isn&apos;t available right now. Try again soon.
        </p>
      )}
      {!locked && !deal.isOnHold && selection.mode === 'store' && (
        <StoreBody selection={selection} actions={actions} />
      )}
      {!locked && !deal.isOnHold && selection.mode === 'online' && (
        <DeliveryBody deal={deal} selection={selection} actions={actions} />
      )}

      <div className={styles.footer}>
        {!locked && <span>{deal.usageLabel}</span>}
        <span>{deal.endsLabel}</span>
      </div>
    </aside>
  );
}
