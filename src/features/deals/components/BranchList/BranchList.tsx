'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import type { DealDetail } from '../../types';
import sectionStyles from '../DealSection.module.css';
import styles from './BranchList.module.css';

type BranchListProps = {
  deal: DealDetail;
  selectedId: string | undefined;
  onSelect: (branchId: string) => void;
};

export function BranchList({ deal, selectedId, onSelect }: BranchListProps) {
  if (deal.branches.length === 0) return null;

  return (
    <section className={sectionStyles.section} aria-labelledby="branches">
      <h2 id="branches" className={sectionStyles.heading}>
        {deal.branchesHeading}
      </h2>
      <div className={styles.list}>
        {deal.branches.map((branch) => (
          <button
            key={branch.id}
            type="button"
            className={styles.branch}
            aria-pressed={branch.id === selectedId}
            onClick={() => onSelect(branch.id)}
          >
            <span className={styles.text}>
              <b>{branch.name}</b>
              <small>{branch.address}</small>
            </span>
            <span className={styles.meta}>
              <span className={clsx(styles.status, !branch.isOpen && styles.closed)}>
                {branch.statusLabel}
              </span>
              <small>{branch.distance}</small>
            </span>
            <span className={styles.tick}>
              <Icon icon={Check} size={14} strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
