import type { LucideIcon } from 'lucide-react';
import { Icon } from '../Icon';
import styles from './StatCard.module.css';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

/** One real number from the server. Never use it for invented figures. */
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.tile}>
        <Icon icon={icon} size={19} />
      </span>
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </div>
  );
}
