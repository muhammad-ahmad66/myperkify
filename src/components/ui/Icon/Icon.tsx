import type { LucideIcon, LucideProps } from 'lucide-react';

type IconProps = Omit<LucideProps, 'ref'> & { icon: LucideIcon };

/** Applies the design system's stroke. Decorative by default. */
export function Icon({ icon: Glyph, size = 20, strokeWidth = 1.9, ...props }: IconProps) {
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden="true" {...props} />;
}
