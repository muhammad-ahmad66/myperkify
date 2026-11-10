import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInFlow } from '@/features/auth/components/SignInFlow';
import { homeFor } from '@/features/session/routing';
import { getViewer } from '@/features/session/server';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  const viewer = await getViewer();
  if (viewer.kind !== 'visitor') redirect(homeFor(viewer));
  return <SignInFlow />;
}
