'use client';

import * as Checkbox from '@radix-ui/react-checkbox';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { Icon } from '../../Icon';
import { FieldMessage, useFieldIds } from '../FieldShell';
import styles from './CheckboxField.module.css';

type CheckboxFieldProps = {
  label: ReactNode;
  id?: string;
  value?: boolean;
  error?: string;
  className?: string;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

export function CheckboxField({
  label,
  id,
  value = false,
  error,
  className,
  onChange,
  onBlur,
  ref,
}: CheckboxFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);

  return (
    <div className={clsx(styles.root, className)}>
      <div
        className={styles.row}
        data-checked={value || undefined}
        data-invalid={Boolean(error) || undefined}
      >
        <Checkbox.Root
          ref={ref}
          id={fieldId}
          className={styles.box}
          checked={value}
          onCheckedChange={(checked) => onChange?.(checked === true)}
          onBlur={onBlur}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={messageId}
        >
          <Checkbox.Indicator className={styles.tick}>
            <Icon icon={Check} size={14} strokeWidth={3} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        <label htmlFor={fieldId}>{label}</label>
      </div>
      <FieldMessage id={messageId} error={error} />
    </div>
  );
}
