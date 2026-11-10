'use client';

import clsx from 'clsx';
import { CheckCircle2, CircleAlert, type LucideIcon } from 'lucide-react';
import { useId, type MouseEvent, type ReactNode } from 'react';
import { Icon } from '../../Icon';
import styles from './FieldShell.module.css';

export type FieldBaseProps = {
  label: ReactNode;
  /** Helper text under the field. Replaced by the error when there is one. */
  hint?: ReactNode;
  hintTone?: 'neutral' | 'success' | 'warning';
  error?: string;
  /** Shows the green tick once the value has passed validation. */
  valid?: boolean;
  icon?: LucideIcon;
  /** Adds a quiet "Optional" tag. Required is the default, so it needs no marker. */
  optional?: boolean;
  /** No frame and no visible label, for a field inside a bar that supplies its own. */
  bare?: boolean;
  className?: string;
};

export function useFieldIds(id?: string) {
  const generated = useId();
  const fieldId = id ?? generated;
  return { fieldId, messageId: `${fieldId}-message` };
}

type FieldMessageProps = {
  id?: string;
  error?: string;
  hint?: ReactNode;
  hintTone?: FieldBaseProps['hintTone'];
  meta?: ReactNode;
};

export function FieldMessage({ id, error, hint, hintTone = 'neutral', meta }: FieldMessageProps) {
  if (!error && !hint && !meta) return null;
  return (
    <div className={styles.message} id={id}>
      {error ? (
        <p className={styles.error} role="alert">
          <Icon icon={CircleAlert} size={14} />
          {error}
        </p>
      ) : (
        <p className={clsx(styles.hint, styles[hintTone])}>{hint}</p>
      )}
      {meta && <span className={styles.meta}>{meta}</span>}
    </div>
  );
}

type FieldShellProps = FieldBaseProps & {
  fieldId: string;
  messageId: string;
  disabled?: boolean;
  /** Kept in the open style while a popover belongs to this field. */
  open?: boolean;
  multiline?: boolean;
  /** A short fixed part before the value, such as PKR or +92. */
  prefix?: string;
  trailing?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
};

/** The look shared by every field: label inside, icon tile, live status, message row. */
export function FieldShell({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  bare,
  className,
  fieldId,
  messageId,
  disabled,
  open,
  multiline,
  prefix,
  trailing,
  meta,
  children,
}: FieldShellProps) {
  function focusField(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, button, a')) return;
    event.preventDefault();
    document.getElementById(fieldId)?.focus();
  }

  return (
    <div className={clsx(styles.root, className)}>
      <div
        className={styles.control}
        data-invalid={Boolean(error) || undefined}
        data-valid={(valid && !error) || undefined}
        data-disabled={disabled || undefined}
        data-open={open || undefined}
        data-multiline={multiline || undefined}
        data-bare={bare || undefined}
        onMouseDown={focusField}
      >
        {icon && (
          <span className={styles.tile}>
            <Icon icon={icon} size={18} />
          </span>
        )}
        <div className={styles.body}>
          <label className={styles.label} htmlFor={fieldId}>
            {label}
            {optional && <span className={styles.optional}>Optional</span>}
          </label>
          <div className={styles.value}>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            {children}
          </div>
        </div>
        {trailing}
        {valid && !error && (
          <span className={styles.status}>
            <Icon icon={CheckCircle2} size={18} />
          </span>
        )}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} hintTone={hintTone} meta={meta} />
    </div>
  );
}
