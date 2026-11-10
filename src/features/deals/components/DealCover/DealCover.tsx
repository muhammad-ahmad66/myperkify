'use client';

import { Share2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/Icon';
import { OfferBadge } from '@/components/ui/OfferBadge';
import type { DealDetail } from '../../types';
import { CoverArtLarge } from '../CoverArt/CoverArt';
import { SaveButton } from '../SaveButton';
import styles from './DealCover.module.css';

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  } catch {
    toast('Copy the link from the address bar');
  }
}

export function DealCover({ deal }: { deal: DealDetail }) {
  return (
    <div className={styles.cover} style={{ background: deal.brand.color }}>
      {deal.image ? (
        <Image
          src={deal.image}
          alt={deal.title}
          fill
          priority
          sizes="(max-width: 1100px) 100vw, 760px"
          className={styles.photo}
        />
      ) : (
        <CoverArtLarge />
      )}
      <div className={styles.tools}>
        <SaveButton
          dealId={deal.id}
          brandName={deal.brand.name}
          saved={deal.isSaved}
          size="cover"
        />
        <button
          type="button"
          className={styles.share}
          aria-label="Copy link to this deal"
          onClick={copyLink}
        >
          <Icon icon={Share2} size={19} />
        </button>
      </div>
      <span className={styles.offer}>
        <OfferBadge offer={deal.stamp.offer} label={deal.stampLong} size="lg" />
      </span>
    </div>
  );
}
