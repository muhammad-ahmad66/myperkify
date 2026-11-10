import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import type { DealDetail } from '../../types';
import styles from './DealBreadcrumb.module.css';

export function DealBreadcrumb({ deal }: { deal: DealDetail }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumb">
      <Link href={ROUTES.deals}>Deals</Link>
      <span aria-hidden="true">/</span>
      <Link href={`${ROUTES.deals}?category=${deal.categoryId}`}>{deal.categoryLabel}</Link>
    </nav>
  );
}
