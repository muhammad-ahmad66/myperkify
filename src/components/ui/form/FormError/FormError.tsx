import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '../../Icon';
import styles from './FormError.module.css';

/** An error about the whole form rather than one field. */
export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className={styles.error} role="alert">
      <Icon icon={CircleAlert} size={16} />
      <span>{children}</span>
    </p>
  );
}
