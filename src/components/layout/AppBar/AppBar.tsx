'use client';

import { Search, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Wrap } from '@/components/ui/Wrap';
import { useCart } from '@/features/cart/hooks';
import { useViewer } from '@/features/session/hooks';
import { isVerified, type Viewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import { useUiStore } from '@/stores/uiStore';
import { AccountMenu } from './AccountMenu';
import styles from './AppBar.module.css';
import { DealsMenu } from './DealsMenu';

/** Who sees what follows the navigation table in docs/04-pages-and-routes.md. */
function navLinks(kind: Viewer['kind']) {
  const howItWorks = { label: 'How it works', href: ROUTES.howItWorks };
  const business = { label: 'For businesses', href: ROUTES.business };
  if (kind === 'visitor') return [howItWorks, business];
  if (kind === 'student') return [howItWorks];
  return [];
}

function CartLink() {
  const { data: cart } = useCart();
  const count = cart?.itemCount ?? 0;

  return (
    <Link
      href={ROUTES.cart}
      className={styles.iconButton}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      <Icon icon={ShoppingBag} />
      {count > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {count}
        </span>
      )}
    </Link>
  );
}

export function AppBar() {
  const { viewer } = useViewer();
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const account = viewer.kind === 'visitor' ? null : viewer;
  const showVerify =
    viewer.kind === 'visitor' || (viewer.kind === 'student' && !isVerified(viewer));

  return (
    <header className={styles.bar}>
      <Wrap className={styles.inner}>
        <Logo />

        <nav className={styles.nav} aria-label="Primary">
          <DealsMenu />
          {navLinks(viewer.kind).map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Search deals"
            onClick={() => setSearchOpen(true)}
          >
            <Icon icon={Search} />
          </button>
          <ThemeToggle />
          {viewer.kind === 'student' && <CartLink />}
          {account ? (
            <AccountMenu account={account} />
          ) : (
            <Link href={ROUTES.signIn} className={styles.signIn}>
              Sign in
            </Link>
          )}
          {showVerify && (
            <ButtonLink href={ROUTES.getVerified} size="sm" className={styles.getVerified}>
              Get verified
            </ButtonLink>
          )}
        </div>
      </Wrap>
    </header>
  );
}
