import { Archivo, Martian_Mono, Onest } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const onest = Onest({ subsets: ['latin'], variable: '--font-onest', display: 'swap' });

export const martian = Martian_Mono({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-martian',
  display: 'swap',
});
