'use client';

import { ArrowRight, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { BrandTile } from '@/components/ui/BrandTile';
import { Icon } from '@/components/ui/Icon';
import { OfferBadge } from '@/components/ui/OfferBadge';
import { useAddToCart } from '@/features/cart/hooks';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { DealCard as DealCardData } from '../../types';
import { CoverArt } from '../CoverArt';
import { SaveButton } from '../SaveButton';
import styles from './DealCard.module.css';

function DealAction({ deal }: { deal: DealCardData }) {
  const addToCart = useAddToCart();

  if (deal.pricing.access === 'locked') {
    return (
      <Link href={ROUTES.getVerified} className={styles.verify}>
        <Icon icon={Lock} size={14} />
        Verify to unlock
      </Link>
    );
  }

  if (deal.mode === 'online') {
    const price = deal.pricing.studentPrice;
    return (
      <button
        type="button"
        className={styles.action}
        disabled={addToCart.isPending}
        aria-busy={addToCart.isPending}
        onClick={() =>
          addToCart.mutate({
            dealId: deal.id,
            optionId: deal.defaultOptionId,
            quantity: 1,
            successMessage: `${deal.brand.name} added to cart at ${formatPKR(price)}`,
          })
        }
      >
        {addToCart.isPending ? 'Adding…' : 'Add to cart'}
      </button>
    );
  }

  return (
    <Link href={ROUTES.deal(deal.slug)} className={styles.action}>
      Claim
      <Icon icon={ArrowRight} size={14} />
    </Link>
  );
}

export function DealCard({ deal }: { deal: DealCardData }) {
  const { pricing } = deal;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {deal.image ? (
          <Image
            className={styles.photo}
            src={deal.image}
            alt=""
            fill
            sizes="(max-width: 520px) 80vw, 300px"
          />
        ) : (
          <CoverArt color={deal.brand.color} seed={deal.artSeed} />
        )}
        <span className={styles.offer}>
          <OfferBadge offer={deal.stamp.offer} label={deal.stamp.label} />
        </span>
        <span className={styles.save}>
          <SaveButton dealId={deal.id} brandName={deal.brand.name} saved={deal.isSaved} />
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.brand}>
          <BrandTile
            initials={deal.brand.initials}
            color={deal.brand.color}
            className={styles.tile}
          />
          <span>{deal.brand.name}</span>
        </div>
        <h3 className={styles.title}>
          <Link href={ROUTES.deal(deal.slug)}>{deal.title}</Link>
        </h3>
        <p className={styles.location}>{deal.location}</p>

        <div className={styles.footer}>
          {pricing.access === 'unlocked' ? (
            <div className={styles.price}>
              <b>
                {formatPKR(pricing.studentPrice)}
                {deal.priceUnit}
              </b>
              <s>{formatPKR(pricing.regularPrice)}</s>
            </div>
          ) : (
            <s className={styles.regular}>{formatPKR(pricing.regularPrice)}</s>
          )}
          <DealAction deal={deal} />
        </div>
      </div>
    </article>
  );
}
