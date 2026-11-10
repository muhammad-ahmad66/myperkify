'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { Segmented } from '@/components/ui/Segmented';
import { PAYMENT_LABELS } from '@/features/orders/labels';
import type { Order, OrderStatus } from '@/features/orders/types';
import { formatPKR } from '@/lib/format';
import { useMerchantOrders, useUpdateOrderStatus } from '../../hooks';
import styles from './MerchantOrders.module.css';

type Tab = 'new' | 'dispatch' | 'completed';

const TAB_LABELS: Record<Tab, string> = {
  new: 'New',
  dispatch: 'To dispatch',
  completed: 'Completed',
};

const TAB_STATUSES: Record<Tab, OrderStatus[]> = {
  new: ['placed'],
  dispatch: ['processing', 'dispatched'],
  completed: ['completed', 'cancelled'],
};

const NEXT_ACTION: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: 'processing', label: 'Accept order' },
  processing: { status: 'dispatched', label: 'Mark dispatched' },
  dispatched: { status: 'completed', label: 'Mark delivered' },
};

function OrderCard({ order }: { order: Order }) {
  const update = useUpdateOrderStatus();
  const action = NEXT_ACTION[order.status];

  return (
    <article className={styles.order}>
      <div className={styles.top}>
        <div>
          <strong>{order.studentName}</strong>
          <span>
            {order.number} · {format(new Date(order.createdAt), 'd MMM, h:mm aaa')}
          </span>
        </div>
        <b>{formatPKR(order.total)}</b>
      </div>
      <ul>
        {order.items.map((item) => (
          <li key={item.title}>
            {item.quantity} × {item.title}
          </li>
        ))}
      </ul>
      <p className={styles.meta}>
        {PAYMENT_LABELS[order.paymentMethod]}
        {order.deliveryAddress && ` · ${order.deliveryAddress}`}
      </p>
      {order.status === 'cancelled' && <p className={styles.meta}>Cancelled</p>}
      {action && (
        <div className={styles.actions}>
          <Button
            loading={update.isPending}
            onClick={() => update.mutate({ id: order.id, status: action.status })}
          >
            {action.label}
          </Button>
          {order.status === 'placed' && (
            <Button
              variant="ghost"
              disabled={update.isPending}
              onClick={() => update.mutate({ id: order.id, status: 'cancelled' })}
            >
              Cancel order
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

export function MerchantOrders() {
  const [tab, setTab] = useState<Tab>('new');
  const query = useMerchantOrders();
  const orders = query.data ?? [];

  const tabs = (Object.keys(TAB_LABELS) as Tab[]).map((value) => {
    const count = orders.filter((order) => TAB_STATUSES[value].includes(order.status)).length;
    return { value, label: count > 0 ? `${TAB_LABELS[value]} ${count}` : TAB_LABELS[value] };
  });

  return (
    <>
      <PageHeader
        title="Orders"
        actions={<Segmented label="Order status" value={tab} options={tabs} onChange={setTab} />}
      />
      <QueryState
        query={query}
        label="your orders"
        isEmpty={(all) => !all.some((order) => TAB_STATUSES[tab].includes(order.status))}
        empty="No orders here right now."
      >
        {(all) => (
          <div className={styles.list}>
            {all
              .filter((order) => TAB_STATUSES[tab].includes(order.status))
              .map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
