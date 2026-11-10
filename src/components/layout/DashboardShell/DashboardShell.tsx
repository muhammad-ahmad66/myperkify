'use client';

import clsx from 'clsx';
import { LogOut, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useSignOut } from '@/features/auth/hooks';
import styles from './DashboardShell.module.css';

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  /** Match this exact path only, for a section's overview page. */
  exact?: boolean;
};

type DashboardShellProps = {
  title: string;
  userName: string;
  nav: DashboardNavItem[];
  children: ReactNode;
};

/** Side navigation on desktop, a scrolling top bar on phones. */
export function DashboardShell({ title, userName, nav, children }: DashboardShellProps) {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Logo />
        <p className={styles.title}>{title}</p>
        <nav className={styles.nav} aria-label={title}>
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(styles.link, active && styles.active)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon icon={item.icon} />
                {item.label}
                {Boolean(item.count) && <span className={styles.count}>{item.count}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={styles.user}>
          <span>{userName}</span>
          <ThemeToggle className={styles.themeButton} />
          <button
            type="button"
            aria-label="Sign out"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            <Icon icon={LogOut} />
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
