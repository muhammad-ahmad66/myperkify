'use client';

import {
  BadgeCheck,
  Bookmark,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Store,
  Tag,
  Ticket,
  User,
  type LucideIcon,
} from 'lucide-react';
import { Menu, MenuButton, MenuHeader, MenuLink, MenuSeparator } from '@/components/ui/Menu';
import { useSignOut } from '@/features/auth/hooks';
import { initials, type Viewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import styles from './AppBar.module.css';

type Account = Exclude<Viewer, { kind: 'visitor' }>;
type Entry = { label: string; href: string; icon: LucideIcon };

/** Each role sees only its own pages. Merchants never see a route to the platform admin. */
function entriesFor(account: Account): Entry[] {
  if (account.kind === 'admin') {
    return [
      { label: 'Verifications', href: ROUTES.adminVerifications, icon: BadgeCheck },
      { label: 'Merchants', href: ROUTES.adminMerchants, icon: Store },
      { label: 'Settlements', href: ROUTES.adminSettlements, icon: Receipt },
    ];
  }
  if (account.kind === 'merchant') {
    const claims = { label: 'Claims', href: ROUTES.merchantClaims, icon: Ticket };
    if (account.role === 'cashier') return [claims];
    return [
      { label: 'Overview', href: ROUTES.merchant, icon: LayoutDashboard },
      claims,
      { label: 'Deals and products', href: ROUTES.merchantDeals, icon: Tag },
      { label: 'Orders', href: ROUTES.merchantOrders, icon: ClipboardList },
      { label: 'Ledger', href: ROUTES.merchantLedger, icon: Receipt },
      { label: 'Settings', href: ROUTES.merchantSettings, icon: Settings },
    ];
  }
  return [
    { label: 'Your account', href: ROUTES.account, icon: User },
    { label: 'My pass', href: ROUTES.myPass, icon: Ticket },
    { label: 'Orders and receipts', href: ROUTES.accountOrders, icon: ClipboardList },
    { label: 'Saved deals', href: ROUTES.accountSaved, icon: Bookmark },
  ];
}

function subtitleFor(account: Account): string {
  if (account.kind === 'merchant') return account.merchant.name;
  return account.email;
}

export function AccountMenu({ account }: { account: Account }) {
  const signOut = useSignOut();

  return (
    <Menu
      trigger={
        <button type="button" className={styles.avatar} aria-label="Your account">
          {initials(account.name)}
        </button>
      }
    >
      <MenuHeader>
        <b className={styles.menuName}>{account.name}</b>
        <span className={styles.menuSub}>{subtitleFor(account)}</span>
      </MenuHeader>
      <MenuSeparator />
      {entriesFor(account).map((entry) => (
        <MenuLink key={entry.href} href={entry.href} icon={entry.icon}>
          {entry.label}
        </MenuLink>
      ))}
      <MenuSeparator />
      <MenuButton icon={LogOut} disabled={signOut.isPending} onSelect={() => signOut.mutate()}>
        Sign out
      </MenuButton>
    </Menu>
  );
}
