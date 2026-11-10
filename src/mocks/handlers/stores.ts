import { getDb, liveDeals } from '../db';
import { toCard } from '../gating';
import { notFound, ok } from '../http';
import { currentUser } from '../session';

export function getStore(request: Request, slug: string): Response {
  const db = getDb();
  const merchant = [...db.merchants.values()].find(
    (entry) => entry.slug === slug && (entry.status === 'active' || entry.status === 'on_hold'),
  );
  if (!merchant) throw notFound("We couldn't find that store.");

  const user = currentUser(request);
  const deals = liveDeals().filter((deal) => deal.merchantId === merchant.id);
  return ok({
    slug: merchant.slug,
    name: merchant.name,
    initials: merchant.initials,
    color: merchant.color,
    description: merchant.description,
    deals: deals.map((deal) => toCard(deal, user)),
    branches: merchant.branches,
  });
}
