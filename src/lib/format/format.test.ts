import { describe, expect, it } from 'vitest';
import { formatClock, formatPKR, formatTimeOfDay, formatTimer } from '.';

describe('formatPKR', () => {
  it('uses a comma thousands separator and no decimals', () => {
    expect(formatPKR(1800)).toBe('PKR 1,800');
    expect(formatPKR(273600)).toBe('PKR 273,600');
    expect(formatPKR(0)).toBe('PKR 0');
  });
});

describe('formatTimer', () => {
  it('formats minutes and padded seconds', () => {
    expect(formatTimer(252)).toBe('4:12');
    expect(formatTimer(300)).toBe('5:00');
    expect(formatTimer(5)).toBe('0:05');
  });

  it('never goes below zero', () => {
    expect(formatTimer(-3)).toBe('0:00');
  });
});

describe('formatClock', () => {
  it('uses lowercase am and pm', () => {
    expect(formatClock(new Date(2026, 10, 4, 13, 5))).toBe('1:05 pm');
  });
});

describe('formatTimeOfDay', () => {
  it('reads like a clock', () => {
    expect(formatTimeOfDay('00:00')).toBe('12:00 am');
    expect(formatTimeOfDay('09:30')).toBe('9:30 am');
    expect(formatTimeOfDay('12:00')).toBe('12:00 pm');
    expect(formatTimeOfDay('23:30')).toBe('11:30 pm');
  });
});
