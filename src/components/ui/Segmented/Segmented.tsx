import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '../Icon';
import styles from './Segmented.module.css';

type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: LucideIcon }[];
  onChange: (value: T) => void;
  block?: boolean;
};

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  block = false,
}: SegmentedProps<T>) {
  return (
    <div className={clsx(styles.track, block && styles.block)} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.segment}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.icon && <Icon icon={option.icon} size={16} />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
