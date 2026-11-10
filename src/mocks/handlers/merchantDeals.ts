import { z } from 'zod';
import { allDeals, getDb, nextId, type MockUser } from '../db';
import { invalid, notFound, ok } from '../http';
import type { SeedDeal } from '../seed/deals';
import { requireRole } from '../session';

const dealBody = z
  .object({
    type: z.enum(['in_store', 'online']),
    title: z.string().trim().min(3),
    description: z.string().trim().min(10),
    categoryId: z.string().min(1),
    stampOffer: z.string().trim().min(1).max(8),
    regularPrice: z.number().int().positive(),
    studentPrice: z.number().int().positive(),
    terms: z.string().trim(),
    status: z.enum(['draft', 'live', 'ended']),
  })
  .refine((deal) => deal.studentPrice < deal.regularPrice, {
    path: ['studentPrice'],
    message: 'Student price must be below the regular price.',
  });

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toRow(deal: SeedDeal) {
  const option = deal.options[0];
  const orders = [...getDb().orders.values()].filter((order) =>
    order.items.some((item) => item.dealId === deal.id),
  );
  return {
    id: deal.id,
    slug: deal.slug,
    title: deal.title,
    type: deal.mode === 'online' ? 'online' : 'in_store',
    description: deal.description,
    image: deal.image,
    categoryId: deal.categoryId,
    stampOffer: deal.stamp.offer,
    regularPrice: option?.regularPrice ?? 0,
    studentPrice: option?.studentPrice ?? 0,
    terms: deal.terms[0]?.value ?? '',
    status: deal.status,
    claims: orders.length,
  };
}

function ownDeal(user: MockUser, id: string): SeedDeal {
  const deal = allDeals().find((entry) => entry.id === id);
  if (!deal || deal.merchantId !== user.merchantId) throw notFound("We couldn't find that deal.");
  return deal;
}

async function readDeal(request: Request) {
  const parsed = dealBody.safeParse(await request.json().catch(() => undefined));
  if (parsed.success) return parsed.data;
  const fields = Object.fromEntries(
    parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
  );
  throw invalid('Check the highlighted fields.', fields);
}

export function listOwnDeals(request: Request): Response {
  const user = requireRole(request, 'merchant_owner');
  return ok(
    allDeals()
      .filter((deal) => deal.merchantId === user.merchantId)
      .map(toRow),
  );
}

export function getOwnDeal(request: Request, id: string): Response {
  return ok(toRow(ownDeal(requireRole(request, 'merchant_owner'), id)));
}

export async function createOwnDeal(request: Request): Promise<Response> {
  const user = requireRole(request, 'merchant_owner');
  const values = await readDeal(request);
  const merchant = getDb().merchants.get(user.merchantId ?? '');
  const template = allDeals().find((deal) => deal.merchantId === user.merchantId);
  if (!merchant) throw notFound();

  const id = nextId('deal');
  const deal: SeedDeal = {
    id,
    slug: `${slugify(merchant.name)}-${slugify(values.title)}-${id.split('_')[1]}`,
    title: values.title,
    heading: values.title,
    description: values.description,
    summaryLine: merchant.description,
    mode: values.type,
    categoryId: values.categoryId,
    merchantId: merchant.id,
    status: values.status,
    brand: { name: merchant.name, initials: merchant.initials, color: merchant.color },
    stamp: { offer: values.stampOffer, label: 'off' },
    stampLong: 'off',
    location: values.type === 'online' ? 'Delivers nationwide' : (template?.location ?? ''),
    priceUnit: null,
    artSeed: getDb().deals.length,
    image: null,
    facts: [
      { icon: 'clock', label: '1 claim a day' },
      { icon: 'shield', label: 'Verified students only' },
    ],
    branchesHeading: 'Branches',
    branches: values.type === 'online' ? [] : merchant.branches,
    terms: values.terms ? [{ label: 'Terms', value: values.terms }] : [],
    options: [
      {
        id: `${id}-standard`,
        label: values.title,
        subLabel: merchant.name,
        regularPrice: values.regularPrice,
        studentPrice: values.studentPrice,
      },
    ],
    optionsLegend: 'Choose your option',
    deliveryFee: values.type === 'online' ? 150 : 0,
    deliveryEstimate: '2 to 4 days',
    maxQuantity: 2,
    claimsPerDay: 1,
    endsLabel: 'Ends 31 Dec 2026',
    relatedHeading: 'More deals you might like',
  };
  getDb().deals.push(deal);
  return ok(toRow(deal), 201);
}

export async function updateOwnDeal(request: Request, id: string): Promise<Response> {
  const user = requireRole(request, 'merchant_owner');
  const deal = ownDeal(user, id);
  const values = await readDeal(request);
  deal.title = values.title;
  deal.heading = values.title;
  deal.description = values.description;
  deal.categoryId = values.categoryId;
  deal.status = values.status;
  deal.stamp = { ...deal.stamp, offer: values.stampOffer };
  const option = deal.options[0];
  if (option) {
    option.regularPrice = values.regularPrice;
    option.studentPrice = values.studentPrice;
  }
  const firstTerm = deal.terms[0];
  if (firstTerm && values.terms) firstTerm.value = values.terms;
  return ok(toRow(deal));
}
