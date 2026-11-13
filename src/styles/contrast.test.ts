import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');
const [lightBlock = '', darkBlock = ''] = css.split(":root[data-theme='dark']");

function readTokens(block: string): Map<string, string> {
  return new Map([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/g)].map((m) => [m[1]!, m[2]!]));
}

const light = readTokens(lightBlock);
/** Dark only overrides what differs, so it starts from the light values. */
const dark = new Map([...light, ...readTokens(darkBlock)]);

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(tokens: Map<string, string>, a: string, b: string): number {
  const [high, low] = [a, b]
    .map((name) => {
      const value = tokens.get(name);
      if (!value) throw new Error(`Missing token ${name}`);
      return luminance(value);
    })
    .sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

const TEXT_PAIRS = [
  ['ink', 'bg'],
  ['ink', 'surface'],
  ['ink-2', 'bg'],
  ['ink-2', 'surface'],
  ['ink-2', 'surface-2'],
  ['ink-3', 'bg'],
  ['ink-3', 'surface'],
  ['ink-3', 'surface-2'],
  ['primary-ink', 'primary'],
  ['primary-ink', 'deep'],
  ['primary-text', 'bg'],
  ['primary-text', 'surface'],
  ['primary-text', 'primary-soft'],
  ['accent-ink', 'accent'],
  ['lime-ink', 'lime'],
  ['coral-text', 'bg'],
  ['coral-text', 'surface'],
  ['mint-text', 'surface'],
  ['mint-text', 'mint-soft'],
  ['warn-text', 'accent-soft'],
  ['danger', 'surface'],
  ['danger', 'danger-soft'],
  ['band-fg-2', 'band'],
] as const;

const CONTROL_PAIRS = [
  ['primary', 'bg'],
  ['line-strong', 'surface'],
  ['line-hover', 'surface'],
] as const;

describe.each([
  ['light', light],
  ['dark', dark],
])('colour contrast in the %s theme (WCAG AA)', (_name, tokens) => {
  it.each(TEXT_PAIRS)('%s on %s passes 4.5:1', (foreground, background) => {
    expect(contrast(tokens, foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(CONTROL_PAIRS)('%s on %s passes 3:1 for controls', (foreground, background) => {
    expect(contrast(tokens, foreground, background)).toBeGreaterThanOrEqual(3);
  });
});
