'use client';

import { Eye, EyeOff, X } from 'lucide-react';
import { useState, type ComponentPropsWithRef } from 'react';
import { Icon } from '../../Icon';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';

type TextFieldProps = FieldBaseProps &
  Omit<ComponentPropsWithRef<'input'>, 'prefix' | 'size' | 'className'> & {
    type?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'password';
    prefix?: string;
    /** Shows a clear button while there is a value. */
    onClear?: () => void;
  };

/** Text, email, URL, search and password. Works with register() or as a controlled input. */
export function TextField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  bare,
  className,
  prefix,
  onClear,
  id,
  type = 'text',
  disabled,
  value,
  ...input
}: TextFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';
  const hasValue = typeof value === 'string' && value.length > 0;

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
      bare={bare}
      className={className}
      disabled={disabled}
      prefix={prefix}
      trailing={
        <>
          {onClear && hasValue && (
            <button type="button" className={shell.action} aria-label="Clear" onClick={onClear}>
              <Icon icon={X} size={16} />
            </button>
          )}
          {isPassword && (
            <button
              type="button"
              className={shell.action}
              aria-label={revealed ? 'Hide password' : 'Show password'}
              onClick={() => setRevealed(!revealed)}
            >
              <Icon icon={revealed ? EyeOff : Eye} size={18} />
            </button>
          )}
        </>
      }
    >
      <input
        id={fieldId}
        className={shell.input}
        type={isPassword && revealed ? 'text' : type}
        disabled={disabled}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
        {...input}
      />
    </FieldShell>
  );
}
