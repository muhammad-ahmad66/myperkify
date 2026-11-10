import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Wrap } from '@/components/ui/Wrap';
import { ROUTES } from '@/lib/routes';
import styles from './Footer.module.css';

const LINKS = [
  { label: 'Deals', href: ROUTES.deals },
  { label: 'For businesses', href: ROUTES.business },
  { label: 'Help', href: ROUTES.help },
  { label: 'Contact', href: ROUTES.contact },
  { label: 'Privacy', href: ROUTES.privacy },
  { label: 'Terms', href: ROUTES.terms },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Wrap className={styles.inner}>
        <Logo />
        <nav className={styles.links} aria-label="Footer">
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <p className={styles.base}>© 2026 MyPerkify</p>
      </Wrap>
    </footer>
  );
}
