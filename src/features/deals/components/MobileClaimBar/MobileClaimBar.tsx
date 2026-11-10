'use client';

import { Button, ButtonLink } from '@/components/ui/Button';
import { formatPKR } from '@/lib/format';
import type { DealDetail } from '../../types';
import type { ClaimActions } from '../DealDetailView/useClaimActions';
import type { ClaimSelection } from '../DealDetailView/useClaimSelection';
import styles from './MobileClaimBar.module.css';

type MobileClaimBarProps = {
  deal: DealDetail;
  selection: ClaimSelection;
  actions: ClaimActions;
};

export function MobileClaimBar({ deal, selection, actions }: MobileClaimBarProps) {
  const { option, mode, quantity } = selection;
  if (!option) return null;
  const { pricing } = option;

  const isDelivery = mode === 'online';
  const saved = pricing.access === 'unlocked' ? pricing.regularPrice - pricing.studentPrice : 0;
  const total =
    pricing.access === 'unlocked'
      ? isDelivery
        ? pricing.studentPrice * quantity + deal.deliveryFee
        : pricing.studentPrice
      : 0;

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div className={styles.bar}>
        <div className={styles.text}>
          <span>
            {option.label} ·{' '}
            {pricing.access === 'unlocked' ? `you save ${formatPKR(saved)}` : 'verify to see price'}
          </span>
          <b>{pricing.access === 'unlocked' ? formatPKR(total) : 'Student price'}</b>
        </div>
        {pricing.access === 'locked' ? (
          <ButtonLink href="#claim" size="lg">
            Unlock
          </ButtonLink>
        ) : isDelivery ? (
          <Button size="lg" loading={actions.isAddingToCart} onClick={actions.addOptionToCart}>
            Add to cart
          </Button>
        ) : (
          <Button size="lg" loading={actions.isClaiming} onClick={actions.claimInStore}>
            {actions.hasLiveClaim ? 'Show my code' : 'Claim in store'}
          </Button>
        )}
      </div>
    </>
  );
}
