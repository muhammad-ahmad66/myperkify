'use client';

import { Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { QueryState } from '@/components/ui/QueryState';
import { Wrap } from '@/components/ui/Wrap';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useOrder } from '../../hooks';
import styles from './OrderConfirmed.module.css';

export function OrderConfirmed({ id }: { id: string }) {
  const query = useOrder(id);

  return (
    <main className={styles.page}>
      <Wrap className={styles.wrap}>
        <QueryState query={query} label="your order">
          {(order) => (
            <>
              <span className={styles.badge}>
                <Icon icon={Check} size={30} strokeWidth={2.6} />
              </span>
              <h1>Your order is in.</h1>
              <p>{order.merchantName} has it. We&apos;ll email you when it&apos;s on the way.</p>
              <dl className={styles.facts}>
                <div>
                  <dt>Order</dt>
                  <dd>{order.number}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{formatPKR(order.total)}</dd>
                </div>
              </dl>
              {order.paymentMethod === 'bank_transfer' && (
                <p className={styles.notice}>
                  You chose bank transfer. {order.merchantName} will send you its account details.
                </p>
              )}
              {order.siblingNumbers.length > 0 && (
                <p className={styles.notice}>
                  Items from other shops became separate orders: {order.siblingNumbers.join(', ')}.
                </p>
              )}
              <div className={styles.actions}>
                <ButtonLink href={ROUTES.accountOrder(order.id)} size="lg">
                  Track your order
                </ButtonLink>
                <ButtonLink href={ROUTES.deals} variant="ghost" size="lg">
                  Back to deals
                </ButtonLink>
              </div>
            </>
          )}
        </QueryState>
      </Wrap>
    </main>
  );
}
