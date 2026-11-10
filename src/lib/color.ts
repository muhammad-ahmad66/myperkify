function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((start) => {
    const channel = parseInt(value.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio of white text on a colour. */
export function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05);
}

/** Colours that fail 4.5:1 behind white text fall back to --deep (design system, section 2). */
export function tileBackground(brandColor: string): string {
  return contrastWithWhite(brandColor) >= 4.5 ? brandColor : 'var(--deep)';
}
