'use client';

import clsx from 'clsx';
import { MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatPKR } from '@/lib/format';
import type { ClaimActions } from '../DealDetailView/useClaimActions';
import type { ClaimSelection } from '../DealDetailView/useClaimSelection';
import styles from './StoreBody.module.css';

export function StoreBody({
  selection,
  actions,
}: {
  selection: ClaimSelection;
  actions: ClaimActions;
}) {
  const { option, branch } = selection;
  if (option?.pricing.access !== 'unlocked' || !branch) return null;
  const { studentPrice, regularPrice } = option.pricing;

  return (
    <div className={styles.body}>
      <div className={styles.pay}>
        <div>
          <span>You pay</span>
          <b>{formatPKR(studentPrice)}</b>
        </div>
        <span className={styles.save}>You save {formatPKR(regularPrice - studentPrice)}</span>
      </div>
      <div className={styles.where}>
        <Icon icon={MapPin} size={16} />
        <span className={styles.branch}>
          <b>{branch.name}</b>
          {branch.distance && ` · ${branch.distance}`}
        </span>
        <span className={clsx(styles.status, !branch.isOpen && styles.closed)}>
          {branch.isOpen ? 'Open now' : 'Closed'}
        </span>
      </div>
      <Button
        size="lg"
        block
        className={styles.claim}
        loading={actions.isClaiming}
        onClick={actions.claimInStore}
      >
        {!actions.isClaiming && <Icon icon={Ticket} />}
        {actions.isClaiming
          ? 'Getting your code…'
          : actions.hasLiveClaim
            ? 'Show my code'
            : 'Claim in store'}
      </Button>
      <p className={styles.note}>Tap at the counter. Your code lasts 5 minutes.</p>
    </div>
  );
}
