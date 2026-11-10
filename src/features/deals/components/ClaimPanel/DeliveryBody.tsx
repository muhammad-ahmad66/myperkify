'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatPKR } from '@/lib/format';
import type { DealDetail } from '../../types';
import type { ClaimActions } from '../DealDetailView/useClaimActions';
import type { ClaimSelection } from '../DealDetailView/useClaimSelection';
import styles from './DeliveryBody.module.css';

type DeliveryBodyProps = {
  deal: DealDetail;
  selection: ClaimSelection;
  actions: ClaimActions;
};

export function DeliveryBody({ deal, selection, actions }: DeliveryBodyProps) {
  const { option, quantity, setQuantity } = selection;
  if (option?.pricing.access !== 'unlocked') return null;

  const { regularPrice, studentPrice } = option.pricing;
  const total = studentPrice * quantity + deal.deliveryFee;

  return (
    <div className={styles.body}>
      <div className={styles.quantity}>
        <span>Quantity</span>
        <div className={styles.stepper}>
          <button
            type="button"
            aria-label="One less"
            disabled={quantity <= 1}
            onClick={() => setQuantity(quantity - 1)}
          >
            <Icon icon={Minus} size={16} />
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            type="button"
            aria-label="One more"
            disabled={quantity >= deal.maxQuantity}
            onClick={() => setQuantity(quantity + 1)}
          >
            <Icon icon={Plus} size={16} />
          </button>
        </div>
      </div>

      <div className={styles.bill}>
        <div>
          <span>
            {option.label} × {quantity}
          </span>
          <span>{formatPKR(regularPrice * quantity)}</span>
        </div>
        <div className={styles.discount}>
          <span>Student discount</span>
          <span>−{formatPKR((regularPrice - studentPrice) * quantity)}</span>
        </div>
        <div>
          <span>Delivery, {deal.deliveryEstimate}</span>
          <span>{formatPKR(deal.deliveryFee)}</span>
        </div>
        <div className={styles.total}>
          <span>Total</span>
          <span>{formatPKR(total)}</span>
        </div>
      </div>

      <Button
        size="lg"
        block
        className={styles.add}
        loading={actions.isAddingToCart}
        onClick={actions.addOptionToCart}
      >
        {actions.isAddingToCart ? 'Adding to cart…' : `Add to cart · ${formatPKR(total)}`}
      </Button>
      <p className={styles.payment}>{deal.paymentMethods.join(' · ')}</p>
    </div>
  );
}
