import { z } from 'zod';
import type { CartSummary } from '@/features/cart/types';
import { allDeals, getDb, nextId, type CartLine, type MockUser } from '../db';
import { invalid, notFound, ok, readJson } from '../http';
import { currentUser, requireVerified } from '../session';

const addItemBody = z.object({
  dealId: z.string(),
  optionId: z.string(),
  quantity: z.number(),
});

function resolveLine(line: CartLine) {
  const deal = allDeals().find((entry) => entry.id === line.dealId);
  const option = deal?.options.find((entry) => entry.id === line.optionId);
  return deal && option ? { deal, option, line } : null;
}

export function resolvedCart(user: MockUser) {
  return user.cart.flatMap((line) => resolveLine(line) ?? []);
}

/** Lines group by shop, one order and one delivery fee each. A mock default for D-07. */
export function toCartSummary(user: MockUser): CartSummary {
  const merchants = getDb().merchants;
  const groups = new Map<string, CartSummary['groups'][number]>();

  for (const { deal, option, line } of resolvedCart(user)) {
    const group = groups.get(deal.merchantId) ?? {
      merchantId: deal.merchantId,
      merchantName: merchants.get(deal.merchantId)?.name ?? deal.brand.name,
      initials: deal.brand.initials,
      color: deal.brand.color,
      deliveryFee: deal.deliveryFee,
      lines: [],
    };
    group.lines.push({
      id: line.id,
      dealSlug: deal.slug,
      title: deal.title,
      image: deal.image,
      optionLabel: option.label,
      regularPrice: option.regularPrice,
      studentPrice: option.studentPrice,
      quantity: line.quantity,
      maxQuantity: deal.maxQuantity,
    });
    groups.set(deal.merchantId, group);
  }

  const list = [...groups.values()];
  const lines = list.flatMap((group) => group.lines);
  const subtotal = lines.reduce((sum, line) => sum + line.regularPrice * line.quantity, 0);
  const discounted = lines.reduce((sum, line) => sum + line.studentPrice * line.quantity, 0);
  const delivery = list.reduce((sum, group) => sum + group.deliveryFee, 0);

  return {
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    groups: list,
    subtotal,
    discount: subtotal - discounted,
    delivery,
    total: discounted + delivery,
  };
}

const EMPTY_CART: CartSummary = {
  itemCount: 0,
  groups: [],
  subtotal: 0,
  discount: 0,
  delivery: 0,
  total: 0,
};

export function getCart(request: Request): Response {
  const user = currentUser(request);
  return ok(user?.role === 'student' ? toCartSummary(user) : EMPTY_CART);
}

export async function addCartItem(request: Request): Promise<Response> {
  const user = requireVerified(request);
  const body = await readJson(request, addItemBody);
  const deal = allDeals().find((entry) => entry.id === body.dealId);
  const option = deal?.options.find((entry) => entry.id === body.optionId);
  if (!deal || !option || deal.mode === 'in_store') {
    throw invalid('That option is no longer available.');
  }

  const existing = user.cart.find(
    (line) => line.dealId === body.dealId && line.optionId === body.optionId,
  );
  const quantity = (existing?.quantity ?? 0) + body.quantity;
  if (!Number.isInteger(body.quantity) || body.quantity < 1 || quantity > deal.maxQuantity) {
    throw invalid(`You can order up to ${deal.maxQuantity} at a time.`);
  }

  if (existing) existing.quantity = quantity;
  else user.cart.push({ id: nextId('line'), dealId: deal.id, optionId: option.id, quantity });
  return ok(toCartSummary(user), 201);
}

export async function updateCartItem(request: Request, id: string): Promise<Response> {
  const user = requireVerified(request);
  const { quantity } = await readJson(request, z.object({ quantity: z.number().int().min(1) }));
  const resolved = resolvedCart(user).find((entry) => entry.line.id === id);
  if (!resolved) throw notFound('That item is no longer in your cart.');
  if (quantity > resolved.deal.maxQuantity) {
    throw invalid(`You can order up to ${resolved.deal.maxQuantity} at a time.`);
  }
  resolved.line.quantity = quantity;
  return ok(toCartSummary(user));
}

export function removeCartItem(request: Request, id: string): Response {
  const user = requireVerified(request);
  user.cart = user.cart.filter((line) => line.id !== id);
  return ok(toCartSummary(user));
}
