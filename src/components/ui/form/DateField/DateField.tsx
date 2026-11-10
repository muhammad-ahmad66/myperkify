'use client';

import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState, type Ref } from 'react';
import { DayPicker } from 'react-day-picker';
import { Icon } from '../../Icon';
import { FieldShell, useFieldIds, type FieldBaseProps } from '../FieldShell';
import shell from '../FieldShell/FieldShell.module.css';
import styles from './DateField.module.css';

type DateFieldProps = FieldBaseProps & {
  id?: string;
  /** An ISO date, like 2026-12-31. */
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLButtonElement>;
};

export function DateField({
  label,
  hint,
  hintTone,
  error,
  valid,
  icon = CalendarDays,
  optional,
  className,
  id,
  value,
  placeholder = 'Pick a date',
  disabled,
  fromDate,
  onChange,
  onBlur,
  ref,
}: DateFieldProps) {
  const { fieldId, messageId } = useFieldIds(id);
  const [open, setOpen] = useState(false);
  const selected = value ? parseISO(value) : undefined;

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) onBlur?.();
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
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
        open={open}
        trailing={<Icon icon={ChevronDown} size={18} className={shell.chevron} />}
      >
        <Popover.Trigger asChild>
          <button
            ref={ref}
            id={fieldId}
            type="button"
            className={clsx(shell.input, shell.trigger)}
            disabled={disabled}
            aria-describedby={messageId}
          >
            <span className={clsx(shell.ellipsis, !selected && shell.placeholder)}>
              {selected ? format(selected, 'd MMMM yyyy') : placeholder}
            </span>
          </button>
        </Popover.Trigger>
      </FieldShell>
      <Popover.Portal>
        <Popover.Content className={shell.popover} sideOffset={20} align="start" alignOffset={-64}>
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={fromDate ? { before: fromDate } : undefined}
            onSelect={(day) => {
              if (day) onChange?.(format(day, 'yyyy-MM-dd'));
              changeOpen(false);
            }}
            classNames={{
              root: styles.root,
              months: styles.months,
              month_caption: styles.caption,
              caption_label: styles.captionLabel,
              nav: styles.nav,
              button_previous: styles.navButton,
              button_next: styles.navButton,
              chevron: styles.navIcon,
              month_grid: styles.grid,
              weekday: styles.weekday,
              day: styles.day,
              day_button: styles.dayButton,
              today: styles.today,
              selected: styles.selected,
              outside: styles.outside,
              disabled: styles.disabledDay,
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
