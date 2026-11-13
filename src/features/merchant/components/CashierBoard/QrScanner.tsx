'use client';

import { BadgeCheck, Check, ScanLine, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { toApiError } from '@/lib/api/errors';
import { formatPKR } from '@/lib/format';
import { useApproveClaim, useScanClaim } from '../../hooks';
import type { PendingClaim } from '../../types';
import styles from './QrScanner.module.css';

type CameraState = 'starting' | 'scanning' | 'blocked' | 'unsupported';

/** Reads frames from the camera until a MyPerkify pass appears. Stops the camera on close. */
function useQrCamera(active: boolean, onCode: (text: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CameraState>('starting');
  const onCodeRef = useRef(onCode);

  useEffect(() => {
    onCodeRef.current = onCode;
  }, [onCode]);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let frame = 0;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia || !context) {
        setState('unsupported');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch {
        setState('blocked');
        return;
      }
      if (stopped) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => undefined);
      setState('scanning');
      const { default: jsQR } = await import('jsqr');

      const tick = () => {
        if (stopped) return;
        if (video.readyState >= video.HAVE_CURRENT_DATA && context) {
          const scale = Math.min(1, 640 / video.videoWidth);
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = context.getImageData(0, 0, canvas.width, canvas.height);
          const found = jsQR(image.data, image.width, image.height, {
            inversionAttempts: 'dontInvert',
          });
          if (found?.data.startsWith('MP1.')) {
            onCodeRef.current(found.data);
            return;
          }
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }

    void start();
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      setState('starting');
    };
  }, [active]);

  return { videoRef, state };
}

function Match({ claim, onDone }: { claim: PendingClaim; onDone: () => void }) {
  const approve = useApproveClaim();

  if (approve.isSuccess) {
    return (
      <div className={styles.approved} role="status">
        <span>
          <Icon icon={Check} size={34} strokeWidth={2.6} />
        </span>
        <b>Approved &amp; paid</b>
        <p>
          {claim.studentName} · {formatPKR(claim.amount)}
        </p>
        <Button size="lg" block onClick={onDone} autoFocus>
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.match}>
      <div className={styles.student}>
        <strong>
          {claim.studentName}
          <Icon icon={BadgeCheck} size={18} />
        </strong>
        <span>{claim.university}</span>
      </div>
      <dl>
        <div>
          <dt>Code</dt>
          <dd className={styles.code}>{claim.code}</dd>
        </div>
        <div>
          <dt>Collect in cash</dt>
          <dd>{formatPKR(claim.amount)}</dd>
        </div>
      </dl>
      <p className={styles.item}>
        {claim.item} · {claim.branchName}
      </p>
      <Button
        size="lg"
        block
        className={styles.approve}
        loading={approve.isPending}
        onClick={() => approve.mutate(claim.id)}
      >
        {approve.isPending ? 'Approving…' : 'Approve & mark paid'}
      </Button>
    </div>
  );
}

function ScanBody({ onClose }: { onClose: () => void }) {
  const scan = useScanClaim();
  const scanning = !scan.data && !scan.isPending;
  const { videoRef, state } = useQrCamera(scanning, (token) => scan.mutate(token));
  const error = scan.error ? toApiError(scan.error).message : null;

  if (scan.data) return <Match claim={scan.data} onDone={onClose} />;

  return (
    <div className={styles.body}>
      <div className={styles.viewport}>
        <video ref={videoRef} muted playsInline aria-hidden="true" />
        <span className={styles.frame} aria-hidden="true" />
        {state === 'blocked' && (
          <p className={styles.overlay}>
            Camera blocked. Allow camera access, or match the 4-digit code instead.
          </p>
        )}
        {state === 'unsupported' && (
          <p className={styles.overlay}>
            This device can&apos;t scan. Match the 4-digit code instead.
          </p>
        )}
        {scan.isPending && <p className={styles.overlay}>Checking…</p>}
      </div>
      <p className={styles.hint} role="status">
        {error ?? 'Point the camera at the QR code on the student’s phone.'}
      </p>
      {error && (
        <Button variant="ghost" block onClick={() => scan.reset()}>
          Scan again
        </Button>
      )}
    </div>
  );
}

export function QrScanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icon icon={ScanLine} size={18} />
        Scan QR
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialog}>
          <div className={styles.head}>
            <div>
              <DialogTitle className={styles.title}>Scan a student pass</DialogTitle>
              <DialogDescription className={styles.sub}>
                The code changes every 30 seconds, so screenshots fail.
              </DialogDescription>
            </div>
            <button
              type="button"
              className={styles.close}
              aria-label="Close scanner"
              onClick={() => setOpen(false)}
            >
              <Icon icon={X} />
            </button>
          </div>
          {open && <ScanBody onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
