'use client';

import styles from './global-error.module.css';

/** Replaces the root layout, so it cannot rely on tokens, fonts or providers. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <title>Something went wrong · MyPerkify</title>
        <h1 className={styles.title}>Something went wrong on our side.</h1>
        <p className={styles.text}>Your account and deals are safe. Try loading the page again.</p>
        <button className={styles.button} onClick={() => retry()}>
          Try again
        </button>
      </body>
    </html>
  );
}
