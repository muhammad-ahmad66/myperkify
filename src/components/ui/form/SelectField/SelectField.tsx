'use client';

import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useState, type Ref } from 'react';
import { Icon } from '../../Icon';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';
import styles from './SelectField.module.css';

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
};

type SelectFieldProps = FieldBaseProps & {
  id?: string;
  name?: string;
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/** A short list with no search. For long lists, use ComboboxField. */
export function SelectField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon,
  optional,
  bare,
  className,
  id,
  name,
  value,
  options,
  placeholder = 'Choose one',
  disabled,
  onChange,
  onBlur,
  ref,
}: SelectFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const [open, setOpen] = useState(false);

  return (
    <Select.Root
      name={name}
      value={value || undefined}
      disabled={disabled}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
      onValueChange={onChange}
    >
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
        open={open}
        trailing={<Icon icon={ChevronDown} size={18} className={shell.chevron} />}
      >
        <Select.Trigger
          ref={ref}
          id={fieldId}
          className={clsx(shell.input, shell.trigger)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={messageId}
        >
          <span className={shell.ellipsis}>
            <Select.Value placeholder={<span className={shell.placeholder}>{placeholder}</span>} />
          </span>
        </Select.Trigger>
      </FieldShell>
      <Select.Portal>
        <Select.Content
          className={clsx(shell.popover, styles.content)}
          position="popper"
          align={bare ? 'end' : 'start'}
          sideOffset={bare ? 16 : 20}
          alignOffset={bare ? -30 : icon ? -64 : -18}
        >
          <Select.Viewport className={styles.viewport}>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className={shell.option}>
                {option.icon && (
                  <span className={shell.optionIcon}>
                    <Icon icon={option.icon} size={16} />
                  </span>
                )}
                <span className={shell.optionText}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  {option.description && <small>{option.description}</small>}
                </span>
                <Select.ItemIndicator className={shell.optionCheck}>
                  <Icon icon={Check} size={16} strokeWidth={2.6} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
