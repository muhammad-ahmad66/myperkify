import clsx from 'clsx';
import { Wrap } from '@/components/ui/Wrap';
import styles from './Process.module.css';

type ProcessProps = {
  steps: { title: string; body: string }[];
  plain?: boolean;
};

export function Process({ steps, plain = false }: ProcessProps) {
  return (
    <section className={styles.section} id="how" aria-labelledby="how-title">
      <Wrap>
        <div className={clsx(styles.panel, plain && styles.plain)}>
          <h2 id="how-title" className={styles.title}>
            How it works
          </h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Wrap>
    </section>
  );
}
