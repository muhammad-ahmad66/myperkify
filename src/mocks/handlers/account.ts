import { z } from 'zod';
import { allDeals, getDb, liveDeals } from '../db';
import { toCard } from '../gating';
import { notFound, ok, readJson } from '../http';
import { requireUser, toViewer, withSession } from '../session';
import { settle } from './claims';

export function listSaved(request: Request): Response {
  const user = requireUser(request);
  return ok(
    liveDeals()
      .filter((deal) => user.saved.has(deal.id))
      .map((deal) => toCard(deal, user)),
  );
}

export function getAccountSummary(request: Request): Response {
  const user = requireUser(request);
  const orders = [...getDb().orders.values()].filter(
    (order) => order.studentId === user.id && order.status === 'completed',
  );
  const live = [...getDb().claims.values()]
    .map(settle)
    .find((claim) => claim.userId === user.id && claim.status === 'pending');
  const deal = allDeals().find((entry) => entry.id === live?.dealId);
  return ok({
    liveClaim: deal ? { dealSlug: deal.slug, brand: deal.brand.name } : null,
    totalSaved: orders.reduce((sum, order) => sum + order.discount, 0),
    completedOrders: orders.length,
    savedDeals: user.saved.size,
  });
}

export async function updateProfile(request: Request): Promise<Response> {
  const user = requireUser(request);
  const { name } = await readJson(request, z.object({ name: z.string().trim().min(2) }));
  user.name = name;
  return ok(toViewer(user));
}

export function deleteAccount(request: Request): Response {
  const user = requireUser(request);
  if (!getDb().users.delete(user.id)) throw notFound();
  return withSession(ok({ deleted: true }), null);
}
