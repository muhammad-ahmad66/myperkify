'use client';

import { ArrowRight, ClipboardList, Plus, Ticket, Wallet } from 'lucide-react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatCard } from '@/components/ui/StatCard';
import { formatClock, formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useMerchantOrders, useOverview } from '../../hooks';
import { BalanceMeter } from '../BalanceMeter';
import styles from './MerchantOverview.module.css';

const RECENT_ORDERS = 5;

function RecentOrders() {
  const { data: orders = [] } = useMerchantOrders();

  return (
    <section className={styles.recent} aria-labelledby="recent-orders">
      <header>
        <h2 id="recent-orders">Recent orders</h2>
        <Link href={ROUTES.merchantOrders}>
          All orders
          <Icon icon={ArrowRight} size={15} />
        </Link>
      </header>
      {orders.length === 0 ? (
        <p className={styles.none}>Orders show here.</p>
      ) : (
        <ul>
          {orders.slice(0, RECENT_ORDERS).map((order) => (
            <li key={order.id}>
              <div>
                <strong>{order.studentName}</strong>
                <span>{formatClock(order.createdAt)}</span>
              </div>
              <b>{formatPKR(order.total)}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MerchantOverview() {
  const query = useOverview();

  return (
    <>
      <PageHeader
        title="Overview"
        actions={
          <ButtonLink href={ROUTES.merchantDealNew}>
            <Icon icon={Plus} size={16} />
            New deal
          </ButtonLink>
        }
      />
      <QueryState query={query} label="your overview">
        {(overview) => (
          <div className={styles.stack}>
            {overview.pendingClaims > 0 && (
              <Link href={ROUTES.merchantClaims} className={styles.pending}>
                <span>
                  <b>{overview.pendingClaims}</b> claim{overview.pendingClaims === 1 ? '' : 's'}{' '}
                  waiting at the counter
                </span>
                <Icon icon={ArrowRight} size={20} />
              </Link>
            )}
            <div className={styles.stats}>
              <StatCard label="Sales today" value={formatPKR(overview.salesToday)} icon={Wallet} />
              <StatCard label="Claims today" value={overview.claimsToday} icon={Ticket} />
              <StatCard label="New online orders" value={overview.newOrders} icon={ClipboardList} />
            </div>
            <div className={styles.columns}>
              <BalanceMeter
                balance={overview.balance}
                threshold={overview.threshold}
                status={overview.status}
              />
              <RecentOrders />
            </div>
          </div>
        )}
      </QueryState>
    </>
  );
}
