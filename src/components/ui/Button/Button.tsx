import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'inverse' | 'outlineInverse';
type Size = 'sm' | 'md' | 'lg';

type StyleProps = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

function buttonClass({ variant = 'primary', size = 'md', block }: StyleProps, className?: string) {
  return clsx(styles.button, styles[variant], styles[size], block && styles.block, className);
}

type ButtonProps = ComponentPropsWithRef<'button'> &
  StyleProps & {
    loading?: boolean;
    children: ReactNode;
  };

export function Button({
  variant,
  size,
  block,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Icon icon={Loader2} size={16} className={styles.spinner} />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...props} />;
}
