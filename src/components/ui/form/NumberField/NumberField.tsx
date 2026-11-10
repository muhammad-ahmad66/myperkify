'use client';

import { Minus, Plus } from 'lucide-react';
import type { Ref } from 'react';
import { NumericFormat } from 'react-number-format';
import { Icon } from '../../Icon';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';

type NumberFieldProps = FieldBaseProps & {
  id?: string;
  name?: string;
  value?: number | null;
  placeholder?: string;
  disabled?: boolean;
  /** A fixed unit before the value, such as PKR. */
  prefix?: string;
  min?: number;
  max?: number;
  /** Shows minus and plus buttons. */
  stepper?: boolean;
  onChange?: (value: number | undefined) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};

/** Whole numbers with thousands separators. Money is an integer in rupees. */
export function NumberField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  className,
  id,
  name,
  value,
  placeholder,
  disabled,
  prefix,
  min = 0,
  max,
  stepper = false,
  onChange,
  onBlur,
  ref,
}: NumberFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const current = value ?? undefined;

  function step(by: number) {
    const next = (current ?? min) + by;
    onChange?.(Math.min(max ?? next, Math.max(min, next)));
  }

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
      prefix={prefix}
      trailing={
        stepper && (
          <>
            <button
              type="button"
              className={shell.action}
              aria-label="One less"
              disabled={disabled || (current ?? min) <= min}
              onClick={() => step(-1)}
            >
              <Icon icon={Minus} size={16} />
            </button>
            <button
              type="button"
              className={shell.action}
              aria-label="One more"
              disabled={disabled || (max !== undefined && (current ?? min) >= max)}
              onClick={() => step(1)}
            >
              <Icon icon={Plus} size={16} />
            </button>
          </>
        )
      }
    >
      <NumericFormat
        id={fieldId}
        name={name}
        getInputRef={ref}
        className={shell.input}
        inputMode="numeric"
        thousandSeparator=","
        decimalScale={0}
        allowNegative={false}
        placeholder={placeholder}
        disabled={disabled}
        value={value ?? ''}
        onValueChange={({ floatValue }, { source }) => {
          if (source === 'event') onChange?.(floatValue);
        }}
        onBlur={onBlur}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
      />
    </FieldShell>
  );
}
