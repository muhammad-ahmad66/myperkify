import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Logo.module.css';

const LOGO_WIDTH = 760;
const LOGO_HEIGHT = 160;

type LogoProps = {
  /** "light" forces the all-white logo, for purple panels in either theme. */
  tone?: 'default' | 'light';
  href?: string;
  className?: string;
};

function LogoImage({ src, className }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={className}
      priority
    />
  );
}

/** The client's wordmark. Replace the PNGs in public/brand if they supply a vector. */
export function Logo({ tone = 'default', href = '/', className }: LogoProps) {
  return (
    <Link href={href} className={clsx(styles.logo, className)} aria-label="MyPerkify home">
      {tone === 'light' ? (
        <LogoImage src="/brand/logo-white.png" />
      ) : (
        <>
          <LogoImage src="/brand/logo-ink.png" className={styles.onLight} />
          <LogoImage src="/brand/logo.png" className={styles.onDark} />
        </>
      )}
    </Link>
  );
}
