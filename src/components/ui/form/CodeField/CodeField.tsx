'use client';

import clsx from 'clsx';
import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp';
import type { Ref } from 'react';
import { FieldMessage, useFieldIds } from '../FieldShell';
import styles from './CodeField.module.css';

type CodeFieldProps = {
  label: string;
  value: string;
  length?: number;
  id?: string;
  error?: string;
  hint?: string;
  onChange: (digits: string) => void;
  onComplete?: (digits: string) => void;
  ref?: Ref<HTMLInputElement>;
};

/** Handles typing, paste and one-time-code autofill. */
export function CodeField({
  label,
  value,
  length = 6,
  id,
  error,
  hint,
  onChange,
  onComplete,
  ref,
}: CodeFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);

  return (
    <div className={styles.root}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <OTPInput
        ref={ref}
        id={fieldId}
        maxLength={length}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        value={value}
        onChange={onChange}
        onComplete={onComplete}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        containerClassName={clsx(styles.boxes, error && styles.bad)}
        render={({ slots }) =>
          slots.map((slot, index) => (
            <span
              key={index}
              className={clsx(
                styles.box,
                slot.char && styles.filled,
                slot.isActive && styles.active,
              )}
            >
              {slot.char ?? (slot.hasFakeCaret ? <i className={styles.caret} /> : null)}
            </span>
          ))
        }
      />
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
