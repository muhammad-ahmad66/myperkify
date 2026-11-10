'use client';

import * as Slider from '@radix-ui/react-slider';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SETTLEMENT_THRESHOLD } from '@/lib/constants';
import { formatPKR } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import { calculateEarnings } from '../../lib/calculator';
import styles from './Calculator.module.css';

type RangeProps = {
  label: string;
  output: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function Range({ label, output, value, min, max, step, onChange }: RangeProps) {
  return (
    <div className={styles.range}>
      <div className={styles.rangeTop}>
        <span>{label}</span>
        <output>{output}</output>
      </div>
      <Slider.Root
        className={styles.slider}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next ?? value)}
      >
        <Slider.Track className={styles.track}>
          <Slider.Range className={styles.fill} />
        </Slider.Track>
        <Slider.Thumb className={styles.thumb} aria-label={label} />
      </Slider.Root>
    </div>
  );
}

export function Calculator({ titleId }: { titleId: string }) {
  const [orders, setOrders] = useState(240);
  const [bill, setBill] = useState(1200);
  const { sales, commission, keep, ordersBetweenSettlements } = calculateEarnings(orders, bill);

  return (
    <div className={styles.calculator}>
      <div className={styles.inputs}>
        <h2 id={titleId}>What would you keep?</h2>
        <Range
          label="Student orders a month"
          output={orders.toLocaleString('en-US')}
          value={orders}
          min={20}
          max={1500}
          step={10}
          onChange={setOrders}
        />
        <Range
          label="Average bill after discount"
          output={formatPKR(bill)}
          value={bill}
          min={200}
          max={6000}
          step={50}
          onChange={setBill}
        />
      </div>
      <div className={styles.result}>
        <span>You keep each month</span>
        <b>{formatPKR(keep)}</b>
        <dl>
          <div>
            <dt>Student sales</dt>
            <dd>{formatPKR(sales)}</dd>
          </div>
          <div>
            <dt>MyPerkify 5%</dt>
            <dd>{formatPKR(commission)}</dd>
          </div>
        </dl>
        <p className={styles.note}>
          An estimate. You settle at {formatPKR(SETTLEMENT_THRESHOLD)}, about every{' '}
          <b>{ordersBetweenSettlements} orders</b>.
        </p>
        <ButtonLink href={ROUTES.businessRegister} size="lg" block className={styles.cta}>
          List your business
          <Icon icon={ArrowRight} size={16} />
        </ButtonLink>
      </div>
    </div>
  );
}
