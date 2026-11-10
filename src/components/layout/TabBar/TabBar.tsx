'use client';

import { Home, LayoutGrid, Ticket, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { ROUTES } from '@/lib/routes';
import styles from './TabBar.module.css';

/** Hidden on deal pages, where the bottom claim bar takes this space. */
export function TabBar() {
  const pathname = usePathname();
  if (pathname.startsWith(`${ROUTES.deals}/`)) return null;

  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <nav className={styles.bar} aria-label="App">
        <Link href={ROUTES.home} aria-current={pathname === ROUTES.home ? 'page' : undefined}>
          <Icon icon={Home} />
          Home
        </Link>
        <Link href={ROUTES.deals} aria-current={pathname === ROUTES.deals ? 'page' : undefined}>
          <Icon icon={LayoutGrid} />
          Deals
        </Link>
        <Link href={ROUTES.myPass} className={styles.pass}>
          <span className={styles.passIcon}>
            <Icon icon={Ticket} />
          </span>
          My pass
        </Link>
        <Link
          href={ROUTES.account}
          aria-current={pathname.startsWith(ROUTES.account) ? 'page' : undefined}
        >
          <Icon icon={User} />
          Account
        </Link>
      </nav>
    </>
  );
}
