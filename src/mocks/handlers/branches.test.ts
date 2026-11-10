import { describe, expect, it } from 'vitest';
import { isOpenAt } from './branches';

const at = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

describe('isOpenAt', () => {
  it('handles a normal day', () => {
    expect(isOpenAt('11:00', '23:00', at('10:59'))).toBe(false);
    expect(isOpenAt('11:00', '23:00', at('11:00'))).toBe(true);
    expect(isOpenAt('11:00', '23:00', at('23:00'))).toBe(false);
  });

  it('handles hours that run past midnight', () => {
    expect(isOpenAt('12:00', '01:00', at('23:30'))).toBe(true);
    expect(isOpenAt('12:00', '01:00', at('00:30'))).toBe(true);
    expect(isOpenAt('12:00', '01:00', at('01:00'))).toBe(false);
    expect(isOpenAt('12:00', '01:00', at('11:59'))).toBe(false);
  });

  it('treats closing at midnight as the end of the day', () => {
    expect(isOpenAt('12:00', '00:00', at('23:59'))).toBe(true);
    expect(isOpenAt('12:00', '00:00', at('00:00'))).toBe(false);
  });
});
