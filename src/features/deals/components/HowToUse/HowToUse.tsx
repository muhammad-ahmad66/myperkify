import type { DealDetail } from '../../types';
import type { ClaimMode } from '../DealDetailView/useClaimSelection';
import sectionStyles from '../DealSection.module.css';
import styles from './HowToUse.module.css';

type HowToUseProps = {
  groups: DealDetail['howTo'];
  mode: ClaimMode;
};

export function HowToUse({ groups, mode }: HowToUseProps) {
  const group = groups.find((entry) => entry.mode === mode) ?? groups[0];
  if (!group) return null;

  return (
    <section className={sectionStyles.section} aria-labelledby="how-to-use">
      <h2 id="how-to-use" className={sectionStyles.heading}>
        How it works
      </h2>
      <ol className={styles.steps}>
        {group.steps.map((step, index) => (
          <li key={step.lead}>
            <span className={styles.number}>{index + 1}</span>
            <b>{step.lead}</b>
            <span className={styles.rest}>{step.rest}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
