'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { StatusPage } from '../StatusPage';

export function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // The monitoring tool is still [OPEN]. Send this there once it is chosen.
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      title="Something went wrong on our side."
      body="Your account and deals are safe. Try loading the page again."
      action={<Button onClick={() => retry()}>Try again</Button>}
    />
  );
}
