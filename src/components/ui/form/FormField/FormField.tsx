'use client';

import type { ChangeEvent, ReactNode, Ref } from 'react';
import { useController, useFormContext } from 'react-hook-form';

type TextChangeEvent = ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>;

/** What every field in this folder needs from a form. Spread it onto the field. */
export type BoundField<TValue> = {
  name: string;
  value: TValue;
  /** Takes a value from custom fields, or the change event from text fields. */
  onChange: (input: TValue | TextChangeEvent) => void;
  onBlur: () => void;
  ref: Ref<never>;
  error: string | undefined;
  valid: boolean;
};

type FormFieldProps<TValue> = {
  name: string;
  render: (field: BoundField<TValue>) => ReactNode;
};

/**
 * Connects a field to the surrounding FormProvider. Value, errors, focus on error and the green
 * tick all come from React Hook Form, so forms stay short:
 *
 *   <FormField<string> name="email" render={(field) => <TextField {...field} label="Email" />} />
 */
export function FormField<TValue = string>({ name, render }: FormFieldProps<TValue>) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  return render({
    name: field.name,
    value: field.value as TValue,
    onChange: field.onChange,
    onBlur: field.onBlur,
    ref: field.ref,
    error: fieldState.error?.message,
    valid: fieldState.isTouched && !fieldState.invalid && Boolean(field.value),
  });
}
