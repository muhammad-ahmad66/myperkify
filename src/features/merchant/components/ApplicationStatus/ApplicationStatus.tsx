import { ButtonLink } from '@/components/ui/Button';
import { StatusPage } from '@/components/layout/StatusPage';
import type { MerchantViewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';

/** A store that is not approved yet sees its status, never the dashboard. */
export function ApplicationStatus({ viewer }: { viewer: MerchantViewer }) {
  const { status, name, rejectionReason } = viewer.merchant;
  const rejected = status === 'rejected';

  return (
    <StatusPage
      title={rejected ? `We can't list ${name} right now.` : `We're reviewing ${name}.`}
      body={
        rejected
          ? (rejectionReason ?? 'Contact us if you would like to talk it through.')
          : "We'll email you as soon as your store is approved. You can then list your first deal."
      }
      action={<ButtonLink href={ROUTES.home}>Back to MyPerkify</ButtonLink>}
    />
  );
}
