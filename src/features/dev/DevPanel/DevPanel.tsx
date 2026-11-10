'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FlaskConical, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useViewer } from '@/features/session/hooks';
import type { Viewer } from '@/features/session/types';
import { ROUTES } from '@/lib/routes';
import {
  devApproveClaim,
  devDecideCard,
  devReset,
  devSetNetwork,
  devSetViewer,
  fetchDevState,
  type DevViewer,
  type NetworkMode,
} from '../api';
import styles from './DevPanel.module.css';

const DEV_STATE_KEY = ['dev', 'state'];
const VIEWERS: { as: DevViewer; label: string }[] = [
  { as: 'visitor', label: 'Visitor' },
  { as: 'pending', label: 'Pending' },
  { as: 'verified', label: 'Verified' },
  { as: 'cashier', label: 'Cashier' },
  { as: 'owner', label: 'Owner' },
  { as: 'admin', label: 'Admin' },
];

const VIEWER_HOME: Partial<Record<DevViewer, string>> = {
  owner: ROUTES.merchant,
  cashier: ROUTES.merchantClaims,
  admin: ROUTES.adminVerifications,
};

function describeViewer(viewer: Viewer): string {
  if (viewer.kind === 'visitor') return 'visitor';
  if (viewer.kind === 'student') return `${viewer.name}, ${viewer.verification.status}`;
  return `${viewer.name}, ${viewer.kind === 'admin' ? 'admin' : viewer.role}`;
}
const NETWORK_MODES: { mode: NetworkMode; label: string }[] = [
  { mode: 'normal', label: 'Normal' },
  { mode: 'slow', label: 'Slow' },
  { mode: 'failing', label: 'Failing' },
];

/**
 * Replaces the prototype's "Preview:" buttons by playing the parts of the flow that belong to
 * other people: the admin, the cashier and the student's inbox. It can also slow down or break
 * the network, so loading and error states can be seen on purpose.
 */
export function DevPanel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { viewer } = useViewer();
  const { data: state } = useQuery({
    queryKey: DEV_STATE_KEY,
    queryFn: fetchDevState,
    enabled: open,
    refetchInterval: open ? 2000 : false,
    meta: { background: true },
  });

  const action = useMutation({
    mutationFn: (run: () => Promise<void>) => run(),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const busy = action.isPending;
  const run = (task: () => Promise<void>) => action.mutate(task);

  function setNetwork(mode: NetworkMode) {
    action.mutate(() => devSetNetwork(mode), {
      onSuccess: () => toast.success(`Network: ${mode}`),
    });
  }

  /* Staff pages are guarded on the server, so changing role needs a full page load. */
  function switchViewer(as: DevViewer) {
    action.mutate(() => devSetViewer(as), {
      onSuccess: () => {
        window.location.assign(VIEWER_HOME[as] ?? ROUTES.home);
      },
    });
  }

  if (!open) {
    return (
      <button className={styles.toggle} onClick={() => setOpen(true)}>
        <FlaskConical size={16} strokeWidth={1.9} aria-hidden="true" />
        Dev
        {state && state.network !== 'normal' && (
          <span className={styles.flag}>{state.network}</span>
        )}
      </button>
    );
  }

  return (
    <section className={styles.panel} aria-label="Development tools">
      <header className={styles.header}>
        <strong>Dev panel</strong>
        <button
          className={styles.close}
          aria-label="Close dev panel"
          onClick={() => setOpen(false)}
        >
          <X size={16} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </header>
      <p className={styles.note}>Viewer: {describeViewer(viewer)}</p>
      <div className={styles.viewers}>
        {VIEWERS.map(({ as, label }) => (
          <button key={as} disabled={busy} onClick={() => switchViewer(as)}>
            {label}
          </button>
        ))}
      </div>
      <p className={styles.note}>Network:</p>
      <div className={styles.row}>
        {NETWORK_MODES.map(({ mode, label }) => (
          <button
            key={mode}
            disabled={busy}
            aria-pressed={state?.network === mode}
            onClick={() => setNetwork(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      {state?.verificationCode && (
        <p className={styles.note}>
          Emailed code: <code>{state.verificationCode}</code>
        </p>
      )}
      {state?.pendingClaimId && (
        <button
          className={styles.primary}
          disabled={busy}
          onClick={() => run(() => devApproveClaim(state.pendingClaimId as string))}
        >
          Cashier approves
        </button>
      )}
      {state?.verificationStatus === 'pending' && (
        <div className={styles.row}>
          <button disabled={busy} onClick={() => run(() => devDecideCard('approve'))}>
            Approve card
          </button>
          <button disabled={busy} onClick={() => run(() => devDecideCard('reject'))}>
            Reject card
          </button>
        </div>
      )}
      <button disabled={busy} onClick={() => run(devReset)}>
        Reset everything
      </button>
    </section>
  );
}
