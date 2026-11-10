import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { initials, type StudentViewer } from '@/features/session/types';
import styles from './IdentityCard.module.css';

type IdentityCardProps = {
  student: StudentViewer;
  animate?: boolean;
};

export function IdentityCard({ student, animate = false }: IdentityCardProps) {
  const verified = student.verification.status === 'verified';

  return (
    <div className={clsx(styles.card, animate && styles.animate)}>
      <div className={styles.row}>
        <span className={styles.avatar}>{initials(student.name)}</span>
        <div className={styles.identity}>
          <b>{student.name}</b>
          <span>{student.university ?? 'University not listed'}</span>
        </div>
      </div>
      <div className={styles.foot}>
        {verified ? (
          <span className={styles.pill}>
            <Icon icon={Check} size={14} strokeWidth={2.8} />
            Verified student
          </span>
        ) : (
          <span className={styles.waiting}>Not verified yet</span>
        )}
        <code>{student.verification.methodLabel}</code>
      </div>
    </div>
  );
}
