import { z } from 'zod';

/**
 * Responses are checked at the boundary. Locked pricing is a strict object, so a response that
 * carries a student price to a locked viewer fails here instead of reaching the page (F-103).
 */
export const dealPricingSchema = z.discriminatedUnion('access', [
  z.strictObject({ access: z.literal('locked'), regularPrice: z.number().int() }),
  z.strictObject({
    access: z.literal('unlocked'),
    regularPrice: z.number().int(),
    studentPrice: z.number().int(),
  }),
]);

const brandSchema = z.object({
  name: z.string(),
  initials: z.string(),
  color: z.string(),
});

export const dealCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  mode: z.enum(['in_store', 'online', 'both']),
  stamp: z.object({ offer: z.string(), label: z.string() }),
  brand: brandSchema,
  location: z.string(),
  categoryId: z.string(),
  categoryLabel: z.string(),
  artSeed: z.number().int(),
  image: z.string().nullable(),
  storeSlug: z.string(),
  priceUnit: z.string().nullable(),
  pricing: dealPricingSchema,
  defaultOptionId: z.string(),
  isSaved: z.boolean(),
});

export const dealSummarySchema = dealCardSchema.pick({
  id: true,
  slug: true,
  title: true,
  mode: true,
  stamp: true,
  brand: true,
  location: true,
  categoryLabel: true,
  artSeed: true,
  image: true,
  storeSlug: true,
});

export const dealOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  subLabel: z.string(),
  pricing: dealPricingSchema,
});

export const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  distance: z.string(),
  statusLabel: z.string(),
  isOpen: z.boolean(),
});

const howToSchema = z.object({
  mode: z.enum(['store', 'online']),
  steps: z.array(z.object({ lead: z.string(), rest: z.string() })),
});

export const dealDetailSchema = dealCardSchema.extend({
  summaryLine: z.string(),
  description: z.string(),
  heading: z.string(),
  stampLong: z.string(),
  facts: z.array(
    z.object({ icon: z.enum(['calendar', 'clock', 'store', 'shield']), label: z.string() }),
  ),
  howTo: z.array(howToSchema),
  branchesHeading: z.string(),
  branches: z.array(branchSchema),
  terms: z.array(z.object({ label: z.string(), value: z.string() })),
  options: z.array(dealOptionSchema),
  optionsLegend: z.string(),
  deliveryFee: z.number().int(),
  deliveryEstimate: z.string(),
  maxQuantity: z.number().int(),
  paymentMethods: z.array(z.string()),
  endsLabel: z.string(),
  usageLabel: z.string(),
  relatedHeading: z.string(),
  isOnHold: z.boolean(),
  related: z.array(dealSummarySchema),
});

export const categorySchema = z.object({
  id: z.string(),
  label: z.string(),
  count: z.number().int(),
});
