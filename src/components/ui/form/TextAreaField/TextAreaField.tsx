'use client';

import type { ComponentPropsWithRef } from 'react';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';
import styles from './TextAreaField.module.css';

type TextAreaFieldProps = FieldBaseProps &
  Omit<ComponentPropsWithRef<'textarea'>, 'className' | 'value'> & {
    value?: string;
  };

/** Grows with its content, and counts characters when it has a limit. */
export function TextAreaField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  className,
  id,
  disabled,
  maxLength,
  value,
  rows = 3,
  ...textarea
}: TextAreaFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);

  return (
    <FieldShell
      fieldId={fieldId}
      messageId={messageId}
      label={label}
      hint={hint}
      hintTone={hintTone}
      error={error}
      valid={valid}
      icon={icon}
      optional={optional}
      className={className}
      disabled={disabled}
      multiline
      meta={maxLength && value !== undefined ? `${value.length} / ${maxLength}` : undefined}
    >
      <textarea
        id={fieldId}
        className={`${shell.input} ${styles.textarea}`}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        {...textarea}
      />
    </FieldShell>
  );
}
