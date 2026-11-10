import clsx from 'clsx';
import styles from './Stamp.module.css';

type StampProps = {
  offer: string;
  label: string;
  size?: 'card' | 'compact' | 'cover';
};

export function Stamp({ offer, label, size = 'card' }: StampProps) {
  return (
    <span className={clsx(styles.stamp, styles[size])}>
      <b>{offer}</b>
      <small>{label}</small>
    </span>
  );
}
