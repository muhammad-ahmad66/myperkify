import { CalendarDays, Clock, ShieldCheck, Store, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { BrandTile } from '@/components/ui/BrandTile';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import type { DealDetail } from '../../types';
import styles from './DealIntro.module.css';

const FACT_ICONS: Record<DealDetail['facts'][number]['icon'], LucideIcon> = {
  calendar: CalendarDays,
  clock: Clock,
  store: Store,
  shield: ShieldCheck,
};

export function DealIntro({ deal }: { deal: DealDetail }) {
  return (
    <div className={styles.intro}>
      <Link href={ROUTES.store(deal.storeSlug)} className={styles.brand}>
        <BrandTile initials={deal.brand.initials} color={deal.brand.color} />
        <span>
          <b>{deal.brand.name}</b>
          <small>{deal.summaryLine}</small>
        </span>
      </Link>
      <h1 className={styles.title}>{deal.heading}</h1>
      {deal.description && <p className={styles.lede}>{deal.description}</p>}
      <ul className={styles.facts}>
        {deal.facts.map((fact) => (
          <li key={fact.label}>
            <Icon icon={FACT_ICONS[fact.icon]} size={17} />
            {fact.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
