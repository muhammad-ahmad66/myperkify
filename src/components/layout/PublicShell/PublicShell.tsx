import type { ReactNode } from 'react';
import { CommandPalette } from '@/features/deals/components/CommandPalette';
import { AppBar } from '../AppBar';
import { Footer } from '../Footer';
import { TabBar } from '../TabBar';

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <AppBar />
      {children}
      <Footer />
      <TabBar />
      <CommandPalette />
    </>
  );
}
