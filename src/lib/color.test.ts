import { describe, expect, it } from 'vitest';
import { contrastWithWhite, tileBackground } from './color';

describe('brand colour contrast', () => {
  it('measures white on a dark brand colour', () => {
    expect(contrastWithWhite('#2933E0')).toBeCloseTo(7.94, 1);
  });

  it('keeps colours that pass and replaces colours that fail', () => {
    expect(tileBackground('#2933E0')).toBe('#2933E0');
    expect(tileBackground('#D2871B')).toBe('var(--deep)');
  });
});
