import clsx from 'clsx';
import { tileBackground } from '@/lib/color';
import styles from './BrandTile.module.css';

type BrandTileProps = {
  initials: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function BrandTile({ initials, color, size = 'md', className }: BrandTileProps) {
  return (
    <span
      className={clsx(styles.tile, styles[size], className)}
      style={{ background: tileBackground(color) }}
    >
      {initials}
    </span>
  );
}
