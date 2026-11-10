'use client';

import * as Switch from '@radix-ui/react-switch';
import type { ReactNode, Ref } from 'react';
import { useFieldIds } from '../FieldShell';
import styles from './SwitchField.module.css';

type SwitchFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  id?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

export function SwitchField({
  label,
  description,
  id,
  value = false,
  onChange,
  onBlur,
  ref,
}: SwitchFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);

  return (
    <div className={styles.row}>
      <div className={styles.text}>
        <label htmlFor={fieldId}>{label}</label>
        {description && <small id={messageId}>{description}</small>}
      </div>
      <Switch.Root
        ref={ref}
        id={fieldId}
        className={styles.track}
        checked={value}
        onCheckedChange={onChange}
        onBlur={onBlur}
        aria-describedby={description ? messageId : undefined}
      >
        <Switch.Thumb className={styles.thumb} />
      </Switch.Root>
    </div>
  );
}
