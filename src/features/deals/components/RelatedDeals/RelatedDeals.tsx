import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { OfferBadge } from '@/components/ui/OfferBadge';
import { ROUTES } from '@/lib/routes';
import type { DealDetail } from '../../types';
import { CoverArt } from '../CoverArt';
import styles from './RelatedDeals.module.css';

export function RelatedDeals({ deal }: { deal: DealDetail }) {
  if (deal.related.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-deals">
      <div className={styles.head}>
        <h2 id="related-deals" className={styles.heading}>
          {deal.relatedHeading}
        </h2>
        <Link href={`${ROUTES.deals}?category=${deal.categoryId}`} className={styles.all}>
          See all
          <Icon icon={ArrowRight} size={16} />
        </Link>
      </div>
      <div className={styles.grid}>
        {deal.related.map((related) => (
          <Link key={related.id} href={ROUTES.deal(related.slug)} className={styles.card}>
            <span className={styles.media}>
              {related.image ? (
                <Image
                  src={related.image}
                  alt=""
                  fill
                  sizes="(max-width: 1100px) 50vw, 290px"
                  className={styles.photo}
                />
              ) : (
                <CoverArt color={related.brand.color} seed={related.artSeed} />
              )}
              <span className={styles.offer}>
                <OfferBadge offer={related.stamp.offer} label={related.stamp.label} />
              </span>
            </span>
            <span className={styles.brand}>{related.brand.name}</span>
            <span className={styles.title}>{related.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
