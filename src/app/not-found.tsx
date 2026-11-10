import type { Metadata } from 'next';
import { StatusPage } from '@/components/layout/StatusPage';
import { ButtonLink } from '@/components/ui/Button';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <StatusPage
      title="This page has moved on."
      body="The deal may have ended, or the link has a typo. Everything live is in the deal directory."
      action={<ButtonLink href={ROUTES.deals}>Browse deals</ButtonLink>}
    />
  );
}
