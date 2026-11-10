'use client';

import * as RadioGroup from '@radix-ui/react-radio-group';
import { Lock } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { formatPKR } from '@/lib/format';
import type { DealDetail } from '../../types';
import type { ClaimSelection } from '../DealDetailView/useClaimSelection';
import styles from './OptionList.module.css';

export function OptionList({ deal, selection }: { deal: DealDetail; selection: ClaimSelection }) {
  const [first] = deal.options;

  // One option has nothing to choose. The title already names it.
  if (deal.options.length === 1 && first) {
    if (first.pricing.access !== 'locked') return null;
    return (
      <p className={styles.regular}>
        <span>Regular price</span>
        <s>{formatPKR(first.pricing.regularPrice)}</s>
      </p>
    );
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{deal.optionsLegend}</legend>
      <RadioGroup.Root
        className={styles.options}
        value={selection.option?.id}
        onValueChange={selection.setOptionId}
        aria-label={deal.optionsLegend}
      >
        {deal.options.map((option) => (
          <RadioGroup.Item key={option.id} value={option.id} className={styles.option}>
            <span className={styles.radio} />
            <span className={styles.text}>
              <b>{option.label}</b>
              <small>{option.subLabel}</small>
            </span>
            <span className={styles.price}>
              {option.pricing.access === 'unlocked' ? (
                <b>{formatPKR(option.pricing.studentPrice)}</b>
              ) : (
                <span className={styles.locked} role="img" aria-label="Student price locked">
                  <Icon icon={Lock} size={13} />
                </span>
              )}
              <s>{formatPKR(option.pricing.regularPrice)}</s>
            </span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </fieldset>
  );
}
