'use client';

import { formatDistanceToNow } from 'date-fns';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import { TextField } from '@/components/ui/form';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { QueryState } from '@/components/ui/QueryState';
import { useDecideVerification, useVerificationQueue } from '../../hooks';
import type { PendingVerification } from '../../types';
import styles from './VerificationQueue.module.css';

const MIN_REASON = 5;

function ReviewCard({ student }: { student: PendingVerification }) {
  const decide = useDecideVerification();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();

  function reject() {
    if (reason.trim().length < MIN_REASON) {
      setReasonError('Tell the student what to fix.');
      return;
    }
    decide.mutate({ id: student.id, decision: 'reject', reason: reason.trim() });
  }

  return (
    <article className={styles.card}>
      <div className={styles.image}>
        <Icon icon={ImageOff} size={24} />
        <span>The mock does not store card photos.</span>
      </div>
      <div className={styles.details}>
        <dl>
          <div>
            <dt>Name entered</dt>
            <dd>{student.name}</dd>
          </div>
          <div>
            <dt>University</dt>
            <dd>{student.university}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{student.email}</dd>
          </div>
          <div>
            <dt>Waiting</dt>
            <dd>
              {student.submittedAt
                ? formatDistanceToNow(new Date(student.submittedAt))
                : 'Just now'}
            </dd>
          </div>
        </dl>

        {rejecting && (
          <TextField
            label="Reason, shown to the student"
            placeholder="The card photo is too blurry to read."
            error={reasonError}
            id={`reason-${student.id}`}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setReasonError(undefined);
            }}
          />
        )}

        <div className={styles.actions}>
          {rejecting ? (
            <>
              <Button loading={decide.isPending} onClick={reject}>
                Send back
              </Button>
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                loading={decide.isPending}
                onClick={() => decide.mutate({ id: student.id, decision: 'approve' })}
              >
                Approve
              </Button>
              <Button variant="ghost" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function VerificationQueue() {
  const query = useVerificationQueue();

  return (
    <>
      <PageHeader title="Verifications" description="Oldest first. Card photos are private." />
      <QueryState
        query={query}
        label="the queue"
        isEmpty={(queue) => queue.length === 0}
        empty="Nothing to review. New student cards appear here."
      >
        {(queue) => (
          <div className={styles.list}>
            {queue.map((student) => (
              <ReviewCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}
