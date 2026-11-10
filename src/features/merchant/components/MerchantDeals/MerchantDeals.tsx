'use client';

import { ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { CoverArt } from '@/features/deals/components/CoverArt';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { useMerchantDeals } from '../../hooks';
import type { MerchantDeal } from '../../types';
import styles from './MerchantDeals.module.css';

const STATUS: Record<MerchantDeal['status'], [BadgeTone, string]> = {
  draft: ['neutral', 'Draft'],
  live: ['success', 'Live'],
  ended: ['danger', 'Ended'],
};

function DealRow({ deal }: { deal: MerchantDeal }) {
  const [tone, label] = STATUS[deal.status];

  return (
    <Link href={ROUTES.merchantDealEdit(deal.id)} className={styles.row}>
      <span className={styles.thumb}>
        {deal.image ? (
          <Image src={deal.image} alt="" fill sizes="72px" />
        ) : (
          <CoverArt color="#A020F0" seed={3} />
        )}
      </span>
      <span className={styles.text}>
        <b>{deal.title}</b>
        <small>{deal.type === 'online' ? 'Online product' : 'In-store deal'}</small>
      </span>
      <span className={styles.price}>
        <b>{formatPKR(deal.studentPrice)}</b>
        <s>{formatPKR(deal.regularPrice)}</s>
      </span>
      <span className={styles.orders}>
        <b>{deal.claims}</b> <small>orders</small>
      </span>
      <span className={styles.status}>
        <StatusBadge tone={tone}>{label}</StatusBadge>
      </span>
      <Icon icon={ChevronRight} size={18} className={styles.chevron} />
    </Link>
  );
}

export function MerchantDeals() {
  const query = useMerchantDeals();

  return (
    <>
      <PageHeader
        title="Deals and products"
        actions={
          <ButtonLink href={ROUTES.merchantDealNew}>
            <Icon icon={Plus} size={16} />
            New item
          </ButtonLink>
        }
      />
      <QueryState
        query={query}
        label="your deals"
        isEmpty={(deals) => deals.length === 0}
        empty="You have no deals yet. Add your first one to reach students."
      >
        {(deals) => (
          <div className={styles.list}>
            {deals.map((deal) => (
              <DealRow key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
