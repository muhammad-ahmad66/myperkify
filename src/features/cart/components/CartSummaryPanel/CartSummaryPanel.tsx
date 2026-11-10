import type { ReactNode } from 'react';
import { formatPKR } from '@/lib/format';
import type { CartSummary } from '../../types';
import styles from './CartSummaryPanel.module.css';

export function CartSummaryPanel({ cart, children }: { cart: CartSummary; children?: ReactNode }) {
  return (
    <aside className={styles.panel} aria-label="Order summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>Regular price</dt>
          <dd>{formatPKR(cart.subtotal)}</dd>
        </div>
        <div className={styles.discount}>
          <dt>Student discount</dt>
          <dd>−{formatPKR(cart.discount)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{formatPKR(cart.delivery)}</dd>
        </div>
        <div className={styles.total}>
          <dt>Total</dt>
          <dd>{formatPKR(cart.total)}</dd>
        </div>
      </dl>
      <p className={styles.saving}>You save {formatPKR(cart.discount)}</p>
      {children}
    </aside>
  );
}
