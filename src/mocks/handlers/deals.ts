import { z } from 'zod';
import { getDb, liveDeals } from '../db';
import { toCard, toDetail, toSummary } from '../gating';
import { notFound, ok, readJson } from '../http';
import { CATEGORIES } from '../seed/deals';
import { currentUser, requireUser } from '../session';
import { usedToday } from './claims';

export function listDeals(request: Request): Response {
  const user = currentUser(request);
  const params = new URL(request.url).searchParams;
  const category = params.get('category') ?? 'all';
  const mode = params.get('mode') ?? 'all';
  const query = (params.get('q') ?? '').trim().toLowerCase();
  const sort = params.get('sort') ?? 'recommended';
  const limit = Number(params.get('limit') ?? 100);

  const deals = liveDeals().filter((deal) => {
    if (category !== 'all' && deal.categoryId !== category) return false;
    if (mode === 'in_store' && deal.mode === 'online') return false;
    if (mode === 'online' && deal.mode === 'in_store') return false;
    if (query && !`${deal.brand.name} ${deal.title}`.toLowerCase().includes(query)) return false;
    return true;
  });
  // Sorting never uses the student price, so the order cannot reveal it to a locked viewer.
  if (sort === 'price') {
    deals.sort((a, b) => (a.options[0]?.regularPrice ?? 0) - (b.options[0]?.regularPrice ?? 0));
  }
  return ok(
    deals.slice(0, limit).map((deal) => toCard(deal, user)),
    200,
    { total: deals.length },
  );
}

export function listCategories(): Response {
  return ok(
    CATEGORIES.map((category) => ({
      ...category,
      count:
        category.id === 'all'
          ? liveDeals().length
          : liveDeals().filter((deal) => deal.categoryId === category.id).length,
    })),
  );
}

export function searchDeals(request: Request): Response {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim().toLowerCase();
  const matches = liveDeals()
    .map(toSummary)
    .filter((deal) =>
      `${deal.brand.name} ${deal.title} ${deal.categoryLabel}`.toLowerCase().includes(query),
    );
  return ok(matches);
}

export function getDeal(request: Request, slug: string): Response {
  const deal = liveDeals().find((entry) => entry.slug === slug);
  if (!deal) throw notFound("We couldn't find that deal.");
  const user = currentUser(request);
  return ok(toDetail(deal, user, user ? usedToday(user.id, deal.id) : 0));
}

export async function setSaved(request: Request, dealId: string): Promise<Response> {
  const user = requireUser(request);
  const { saved } = await readJson(request, z.object({ saved: z.boolean() }));
  if (saved) user.saved.add(dealId);
  else user.saved.delete(dealId);
  return ok({ saved });
}

export async function createReport(request: Request): Promise<Response> {
  const { dealId } = await readJson(request, z.object({ dealId: z.string() }));
  getDb().reports.push({ userId: currentUser(request)?.id ?? null, dealId });
  return ok({ received: true }, 201);
}
