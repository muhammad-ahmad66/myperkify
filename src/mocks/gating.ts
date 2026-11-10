import type { DealCard, DealDetail, DealPricing, DealSummary } from '@/features/deals/types';
import type { MockUser } from './db';
import { getDb, liveDeals } from './db';
import { CATEGORIES, type SeedDeal, type SeedOption } from './seed/deals';
import { canSeeStudentPrices } from './session';

/**
 * The one place a student price can leave the mock server. Locked viewers get the regular price
 * and nothing else (F-103). The real backend must behave the same way.
 */
function toPricing(option: SeedOption, user: MockUser | null): DealPricing {
  if (!canSeeStudentPrices(user)) {
    return { access: 'locked', regularPrice: option.regularPrice };
  }
  return {
    access: 'unlocked',
    regularPrice: option.regularPrice,
    studentPrice: option.studentPrice,
  };
}

function categoryLabel(deal: SeedDeal): string {
  return CATEGORIES.find((category) => category.id === deal.categoryId)?.label ?? '';
}

export function toSummary(deal: SeedDeal): DealSummary {
  return {
    id: deal.id,
    slug: deal.slug,
    title: deal.title,
    mode: deal.mode,
    stamp: deal.stamp,
    brand: deal.brand,
    location: deal.location,
    categoryLabel: categoryLabel(deal),
    artSeed: deal.artSeed,
    image: deal.image,
    storeSlug: deal.merchantId,
  };
}

export function toCard(deal: SeedDeal, user: MockUser | null): DealCard {
  const option = deal.options[0]!;
  return {
    ...toSummary(deal),
    categoryId: deal.categoryId,
    priceUnit: deal.priceUnit,
    pricing: toPricing(option, user),
    defaultOptionId: option.id,
    isSaved: user?.saved.has(deal.id) ?? false,
  };
}

export function toDetail(deal: SeedDeal, user: MockUser | null, usedToday: number): DealDetail {
  const related = liveDeals().filter(
    (other) => other.categoryId === deal.categoryId && other.id !== deal.id,
  );
  return {
    ...toCard(deal, user),
    summaryLine: deal.summaryLine,
    description: deal.description,
    heading: deal.heading,
    stampLong: deal.stampLong,
    facts: deal.facts,
    howTo: buildHowTo(deal),
    branchesHeading: deal.branchesHeading,
    branches: deal.branches,
    terms: deal.terms,
    options: deal.options.map((option) => ({
      id: option.id,
      label: option.label,
      subLabel: option.subLabel,
      pricing: toPricing(option, user),
    })),
    optionsLegend: deal.optionsLegend,
    deliveryFee: deal.deliveryFee,
    deliveryEstimate: deal.deliveryEstimate,
    maxQuantity: deal.maxQuantity,
    paymentMethods: ['Cash on delivery', 'Bank transfer'],
    endsLabel: deal.endsLabel,
    usageLabel: canSeeStudentPrices(user)
      ? `${usedToday} of ${deal.claimsPerDay} used today`
      : 'Free for verified students',
    relatedHeading: deal.relatedHeading,
    isOnHold: getDb().merchants.get(deal.merchantId)?.status === 'on_hold',
    related: (related.length > 0 ? related : liveDeals().filter((other) => other.id !== deal.id))
      .slice(0, 4)
      .map(toSummary),
  };
}

function buildHowTo(deal: SeedDeal): DealDetail['howTo'] {
  const store = {
    mode: 'store' as const,
    steps: [
      { lead: 'Order at the counter', rest: "Say you're using MyPerkify." },
      { lead: 'Claim in store', rest: 'Show the cashier your 4-digit code.' },
      { lead: 'Pay the student price', rest: 'Your receipt arrives by email.' },
    ],
  };
  const online = {
    mode: 'online' as const,
    steps: [
      { lead: 'Add to cart', rest: 'Pick your option first.' },
      { lead: 'Check out', rest: 'Cash on delivery or bank transfer.' },
      { lead: 'Track your order', rest: 'From your account.' },
    ],
  };
  if (deal.mode === 'in_store') return [store];
  if (deal.mode === 'online') return [online];
  return [store, online];
}
