import type { ReactNode } from 'react';
import styles from './StateMessage.module.css';

type StateMessageProps = {
  children: ReactNode;
  action?: ReactNode;
  role?: 'alert' | 'status';
};

/** Empty and error states inside a data view. */
export function StateMessage({ children, action, role = 'status' }: StateMessageProps) {
  return (
    <div className={styles.message} role={role}>
      <p>{children}</p>
      {action}
    </div>
  );
}
