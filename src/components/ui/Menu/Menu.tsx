'use client';

import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Menu.module.css';

type MenuProps = {
  /** A single button. It receives the open state and keyboard handling. */
  trigger: ReactElement;
  align?: 'start' | 'end';
  children: ReactNode;
};

/** Not modal, so opening it never locks the page or shifts the layout. */
export function Menu({ trigger, align = 'end', children }: MenuProps) {
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className={styles.content} align={align} sideOffset={10}>
          {children}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

type MenuLinkProps = {
  href: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function MenuLink({ href, icon, children }: MenuLinkProps) {
  return (
    <Dropdown.Item asChild>
      <Link href={href} className={styles.item}>
        {icon && <Icon icon={icon} size={18} />}
        {children}
      </Link>
    </Dropdown.Item>
  );
}

type MenuButtonProps = {
  icon?: LucideIcon;
  disabled?: boolean;
  onSelect: () => void;
  children: ReactNode;
};

export function MenuButton({ icon, disabled, onSelect, children }: MenuButtonProps) {
  return (
    <Dropdown.Item className={styles.item} disabled={disabled} onSelect={onSelect}>
      {icon && <Icon icon={icon} size={18} />}
      {children}
    </Dropdown.Item>
  );
}

export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className={styles.header}>{children}</div>;
}

export function MenuSeparator() {
  return <Dropdown.Separator className={styles.separator} />;
}
