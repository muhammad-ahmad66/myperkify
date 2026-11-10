import 'server-only';
import { redirect, unstable_rethrow } from 'next/navigation';
import { serverGet } from '@/lib/api/server';
import { ROUTES } from '@/lib/routes';
import type { AdminViewer, MerchantViewer, StudentViewer, Viewer } from './types';

/** The root layout depends on this, so a failed lookup falls back to a visitor, not an error page. */
export async function getViewer(): Promise<Viewer> {
  try {
    return await serverGet<Viewer>('/session');
  } catch (error) {
    // Next.js signals such as dynamic rendering travel as thrown errors. They must pass through.
    unstable_rethrow(error);
    console.error('Could not load the session', error);
    return { kind: 'visitor' };
  }
}

/*
 * These guards send people to the right page. They are not the protection: every API endpoint
 * checks the role itself. When auth is chosen (D-03, D-16), add Next.js request interception too.
 */
export async function requireStudent(): Promise<StudentViewer> {
  const viewer = await getViewer();
  if (viewer.kind !== 'student') redirect(ROUTES.signIn);
  return viewer;
}

export async function requireVerifiedStudent(): Promise<StudentViewer> {
  const viewer = await getViewer();
  if (viewer.kind !== 'student' || viewer.verification.status !== 'verified') {
    redirect(ROUTES.getVerified);
  }
  return viewer;
}

export async function requireMerchant(): Promise<MerchantViewer> {
  const viewer = await getViewer();
  if (viewer.kind !== 'merchant') redirect(ROUTES.signIn);
  return viewer;
}

/** Cashiers work the counter only. */
export async function requireOwner(): Promise<MerchantViewer> {
  const viewer = await requireMerchant();
  if (viewer.role !== 'merchant_owner') redirect(ROUTES.merchantClaims);
  return viewer;
}

export async function requireAdmin(): Promise<AdminViewer> {
  const viewer = await getViewer();
  if (viewer.kind !== 'admin') redirect(ROUTES.signIn);
  return viewer;
}
