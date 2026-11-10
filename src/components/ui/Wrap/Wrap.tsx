import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Wrap.module.css';

export function Wrap({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={clsx(styles.wrap, className)} {...props} />;
}
