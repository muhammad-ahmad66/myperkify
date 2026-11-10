import clsx from 'clsx';
import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span className={clsx(styles.skeleton, className)} style={style} aria-hidden="true" />;
}
