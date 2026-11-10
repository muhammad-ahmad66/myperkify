'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import type { ApiSuccess } from '@/lib/api/types';
import type { ApplicationValues } from './schemas';

const DRAFT_KEY = 'mp_business_application_v2';
const SAVE_DELAY_MS = 500;

async function submitApplication(values: ApplicationValues): Promise<{ reference: string }> {
  const { proof, ...data } = values;
  const body = new FormData();
  body.append('application', JSON.stringify(data));
  if (proof) body.append('proof', proof);
  const response = await api.post<ApiSuccess<{ reference: string }>>(
    '/business/applications',
    body,
  );
  return response.data.data;
}

export function useSubmitApplication() {
  return useMutation({
    mutationFn: submitApplication,
    meta: { inlineError: true },
    onSuccess: () => {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // Storage can be blocked. The draft simply stays until the tab closes.
      }
    },
  });
}

type DraftStatus = 'idle' | 'saved';

function withoutFile<T extends { proof?: unknown }>(values: T) {
  const draft = { ...values };
  delete draft.proof;
  return draft;
}

/**
 * Keeps typed answers through a refresh, for this tab only. Files cannot be kept this way, and
 * nothing here is sent anywhere until the application is submitted.
 */
export function useApplicationDraft(form: UseFormReturn<ApplicationValues>) {
  const [status, setStatus] = useState<DraftStatus>('idle');
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        form.reset({ ...form.getValues(), ...(JSON.parse(saved) as Partial<ApplicationValues>) });
        toast('We restored your draft');
      }
    } catch {
      // A blocked or damaged draft is not worth interrupting anyone for.
    }
  }, [form]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const subscription = form.watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify(withoutFile(values)));
          setStatus('saved');
        } catch {
          setStatus('idle');
        }
      }, SAVE_DELAY_MS);
    });
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [form]);

  return status;
}
