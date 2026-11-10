'use client';

import { Smartphone } from 'lucide-react';
import type { Ref } from 'react';
import { PatternFormat } from 'react-number-format';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';

type PhoneFieldProps = FieldBaseProps & {
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (digits: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
};

/** A Pakistani mobile number. The value is the ten digits after +92. */
export function PhoneField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon = Smartphone,
  optional,
  className,
  id,
  name,
  value,
  placeholder = '300 1234567',
  disabled,
  onChange,
  onBlur,
  ref,
}: PhoneFieldProps) {
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
      prefix="+92"
    >
      <PatternFormat
        id={fieldId}
        name={name}
        getInputRef={ref}
        className={shell.input}
        format="### #######"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder}
        disabled={disabled}
        value={value ?? ''}
        onValueChange={({ value: digits }) => onChange?.(digits)}
        onBlur={onBlur}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={messageId}
      />
    </FieldShell>
  );
}
