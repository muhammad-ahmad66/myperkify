import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/layout/AppProviders';
import { AppToaster } from '@/components/layout/AppToaster';
import { NetworkProgress } from '@/components/layout/NetworkProgress';
import { OfflineNotice } from '@/components/layout/OfflineNotice';
import { DevPanel } from '@/features/dev/DevPanel';
import { getViewer } from '@/features/session/server';
import { DEV_TOOLS_ENABLED } from '@/lib/api/config';
import { archivo, martian, onest } from '@/lib/fonts';
import { parseTheme, THEME_COOKIE } from '@/lib/theme';
import '@/styles/tokens.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: { default: 'MyPerkify', template: '%s · MyPerkify' },
  description:
    'MyPerkify: verified student discounts at cafés, bookshops, gyms and online stores across Pakistan. Free for students.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${archivo.variable} ${onest.variable} ${martian.variable}`}
    >
      <body>
        <AppProviders viewer={viewer}>
          <NetworkProgress />
          <OfflineNotice />
          {children}
          <AppToaster />
          {DEV_TOOLS_ENABLED && <DevPanel />}
        </AppProviders>
      </body>
    </html>
  );
}
