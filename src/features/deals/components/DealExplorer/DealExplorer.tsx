'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateMessage } from '@/components/ui/StateMessage';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';
import { HOME_DEAL_FILTERS } from '../../constants';
import { useDeals } from '../../hooks';
import { DealCard } from '../DealCard';
import styles from './DealExplorer.module.css';

/** The homepage's short list. Filters and search live on the deals page. */
export function DealExplorer() {
  const { data: deals, isPending, isError, isFetching, refetch } = useDeals(HOME_DEAL_FILTERS);

  return (
    <section className={styles.section} id="deals" aria-labelledby="deals-title">
      <Wrap>
        <div className={styles.head}>
          <h2 id="deals-title" className={styles.title}>
            Student deals
          </h2>
          <Link className={styles.all} href={ROUTES.deals}>
            See all
            <Icon icon={ArrowRight} size={16} />
          </Link>
        </div>

        {isPending && (
          <div className={styles.grid} aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className={styles.skeleton} />
            ))}
          </div>
        )}

        {isError && (
          <StateMessage
            role="alert"
            action={
              <Button variant="ghost" size="sm" loading={isFetching} onClick={() => refetch()}>
                Try again
              </Button>
            }
          >
            We couldn&apos;t load deals just now. Check your connection and try again.
          </StateMessage>
        )}

        {deals && !isError && deals.length === 0 && (
          <StateMessage>New deals are on the way.</StateMessage>
        )}

        {deals && !isError && deals.length > 0 && (
          <div className={styles.grid}>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </Wrap>
    </section>
  );
}
