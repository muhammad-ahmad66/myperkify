import { z } from 'zod';
import { blankUser, getDb, nextId, resetDb, type MockUser } from '../db';
import { notFound, ok, readJson } from '../http';
import { currentUser, toViewer, withSession } from '../session';
import { DEMO_ACCOUNTS } from '../seed/activity';
import { redeemClaim } from './merchant';

function demoStudent(status: MockUser['status']): MockUser {
  const verified = status === 'verified';
  return {
    ...blankUser(nextId('user')),
    name: 'Ayesha Khan',
    email: `ayesha.k${getDb().sequence}@lums.edu.pk`,
    universityId: 'lums',
    status,
    method: status === 'pending' ? 'card' : verified ? 'email' : null,
    methodLabel: verified ? 'via lums.edu.pk' : null,
    submittedAt: status === 'pending' ? new Date().toISOString() : null,
  };
}

/** What the Dev panel needs to drive the flows that belong to other roles. */
export function getDevState(request: Request): Response {
  const user = currentUser(request);
  const claim = user
    ? [...getDb().claims.values()].find(
        (entry) => entry.userId === user.id && entry.status === 'pending',
      )
    : undefined;
  return ok({
    verificationCode: user?.verificationCode ?? getDb().lastCode,
    pendingClaimId: claim?.id ?? null,
    verificationStatus: user?.status ?? null,
    network: getDb().network,
  });
}

export async function setViewer(request: Request): Promise<Response> {
  const body = await readJson(
    request,
    z.object({ as: z.enum(['visitor', 'verified', 'pending', 'owner', 'cashier', 'admin']) }),
  );
  if (body.as === 'visitor') return withSession(ok(toViewer(null)), null);
  if (body.as === 'owner' || body.as === 'cashier' || body.as === 'admin') {
    const account = getDb().users.get(DEMO_ACCOUNTS[body.as].id) ?? null;
    return withSession(ok(toViewer(account)), account?.id ?? null);
  }
  const user = demoStudent(body.as);
  getDb().users.set(user.id, user);
  return withSession(ok(toViewer(user)), user.id);
}

export async function decideCard(request: Request): Promise<Response> {
  const user = currentUser(request);
  if (!user) throw notFound();
  const body = await readJson(request, z.object({ decision: z.enum(['approve', 'reject']) }));
  if (body.decision === 'approve') {
    user.status = 'verified';
    user.methodLabel = 'via student card';
  } else {
    user.status = 'rejected';
    user.rejectionReason =
      'The expiry date is hidden by glare. Please retake the photo away from direct light.';
  }
  return ok(toViewer(user));
}

export async function setNetwork(request: Request): Promise<Response> {
  const { mode } = await readJson(
    request,
    z.object({ mode: z.enum(['normal', 'slow', 'failing']) }),
  );
  getDb().network = mode;
  return ok({ network: mode });
}

export function devApproveClaim(id: string): Response {
  const claim = getDb().claims.get(id);
  if (!claim) throw notFound();
  return ok(redeemClaim(claim));
}

export function reset(): Response {
  resetDb();
  return withSession(ok({ reset: true }), null);
}
