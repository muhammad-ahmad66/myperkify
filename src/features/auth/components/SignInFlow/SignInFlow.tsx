'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CodeStep } from './CodeStep';
import { EmailStep } from './EmailStep';
import styles from './SignInFlow.module.css';

export function SignInFlow() {
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className={styles.split}>
      <aside className={styles.side}>
        <Image
          src="/images/auth/students.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className={styles.photo}
        />
        <div className={styles.sideText}>
          <Logo tone="light" />
          <p>
            Show your phone.
            <br />
            Pay the student price.
          </p>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.top}>
          <span className={styles.mobileLogo}>
            <Logo />
          </span>
          <ThemeToggle />
        </div>
        <div className={styles.column}>
          {codeSent ? (
            <CodeStep email={email} onChangeEmail={() => setCodeSent(false)} />
          ) : (
            <EmailStep
              defaultEmail={email}
              onSent={(sentTo) => {
                setEmail(sentTo);
                setCodeSent(true);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
