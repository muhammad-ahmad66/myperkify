import clsx from 'clsx';
import styles from './OfferBadge.module.css';

type OfferBadgeProps = {
  offer: string;
  label: string;
  size?: 'md' | 'lg';
};

/** The offer, on a photo. White in both themes, so it reads on any image. */
export function OfferBadge({ offer, label, size = 'md' }: OfferBadgeProps) {
  return (
    <span className={clsx(styles.badge, size === 'lg' && styles.lg)}>
      <b>{offer}</b> {label}
    </span>
  );
}
