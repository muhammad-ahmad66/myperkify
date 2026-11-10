'use client';

import { ChevronDown, Flag } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { useReportDeal } from '../../hooks';
import type { DealDetail } from '../../types';
import sectionStyles from '../DealSection.module.css';
import styles from './FinePrint.module.css';

export function FinePrint({ deal }: { deal: DealDetail }) {
  const report = useReportDeal();

  return (
    <section className={sectionStyles.section}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          <h2 className={sectionStyles.heading}>Terms</h2>
          <Icon icon={ChevronDown} size={20} className={styles.chevron} />
        </summary>
        <dl className={styles.terms}>
          {deal.terms.map((term) => (
            <div key={term.label}>
              <dt>{term.label}</dt>
              <dd>{term.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <button
        type="button"
        className={styles.report}
        aria-busy={report.isPending}
        disabled={report.isPending}
        onClick={() => report.mutate(deal.id)}
      >
        <Icon icon={Flag} size={14} />
        {report.isPending ? 'Sending your report…' : 'Report a problem'}
      </button>
    </section>
  );
}
