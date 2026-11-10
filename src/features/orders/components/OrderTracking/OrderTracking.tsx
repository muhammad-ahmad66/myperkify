'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { ArrowLeft, Check, Download } from 'lucide-react';
import Link from 'next/link';
import { BrandTile } from '@/components/ui/BrandTile';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Wrap } from '@/components/ui/Wrap';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useOrder } from '../../hooks';
import { ORDER_STATUS, PAYMENT_LABELS } from '../../labels';
import type { Order, OrderStatus } from '../../types';
import { receiptUrl } from '../../urls';
import styles from './OrderTracking.module.css';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed', label: 'Placed' },
  { status: 'processing', label: 'Preparing' },
  { status: 'dispatched', label: 'Dispatched' },
  { status: 'completed', label: 'Delivered' },
];

function Timeline({ order }: { order: Order }) {
  const current = STEPS.findIndex((step) => step.status === order.status);

  return (
    <ol className={styles.timeline}>
      {STEPS.map((step, index) => {
        const done = index < current || order.status === 'completed';
        const isCurrent = index === current && order.status !== 'completed';
        return (
          <li
            key={step.status}
            className={clsx(done && styles.reached)}
            aria-current={isCurrent ? 'step' : undefined}
          >
            <span className={clsx(styles.dot, done && styles.done, isCurrent && styles.now)}>
              {done && <Icon icon={Check} size={14} strokeWidth={3} />}
            </span>
            <span>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderTracking({ id }: { id: string }) {
  const query = useOrder(id);

  return (
    <main className={styles.page}>
      <Wrap className={styles.wrap}>
        <Link className={styles.back} href={ROUTES.account}>
          <Icon icon={ArrowLeft} size={15} />
          Your account
        </Link>
        <QueryState query={query} label="this order">
          {(order) => {
            const [tone, label] = ORDER_STATUS[order.status];
            return (
              <>
                <PageHeader title={`Order ${order.number}`} />
                <div className={styles.status}>
                  <BrandTile initials={order.merchantInitials} color={order.merchantColor} />
                  <strong>{order.merchantName}</strong>
                  <StatusBadge tone={tone}>{label}</StatusBadge>
                </div>
                {order.source === 'online' && order.status !== 'cancelled' && (
                  <Timeline order={order} />
                )}

                <ul className={styles.items}>
                  {order.items.map((item) => (
                    <li key={item.title}>
                      <span>
                        {item.quantity} × {item.title}
                      </span>
                      <span>{formatPKR(item.studentPrice * item.quantity)}</span>
                    </li>
                  ))}
                  {order.deliveryFee > 0 && (
                    <li>
                      <span>Delivery</span>
                      <span>{formatPKR(order.deliveryFee)}</span>
                    </li>
                  )}
                  <li className={styles.total}>
                    <span>Total</span>
                    <span>{formatPKR(order.total)}</span>
                  </li>
                </ul>

                <dl className={styles.facts}>
                  <div>
                    <dt>Placed</dt>
                    <dd>{format(new Date(order.createdAt), 'd MMM yyyy, h:mm aaa')}</dd>
                  </div>
                  <div>
                    <dt>Payment</dt>
                    <dd>{PAYMENT_LABELS[order.paymentMethod]}</dd>
                  </div>
                  <div>
                    <dt>{order.deliveryAddress ? 'Delivering to' : 'Branch'}</dt>
                    <dd>{order.deliveryAddress ?? order.branchName}</dd>
                  </div>
                </dl>

                {order.hasReceipt && (
                  <a className={styles.receipt} href={receiptUrl(order.id)}>
                    <Icon icon={Download} size={16} />
                    Download PDF receipt
                  </a>
                )}
              </>
            );
          }}
        </QueryState>
      </Wrap>
    </main>
  );
}
