import { z } from 'zod';
import type { Order } from '@/features/orders/types';
import { API_ERROR_CODES } from '@/lib/api/types';
import { getDb, nextId, type MockOrder, type MockUser } from '../db';
import { HttpError, invalid, notFound, ok } from '../http';
import { transactionId } from '../ledger';
import { buildReceipt } from '../receipt';
import { requireUser, requireVerified, universityName } from '../session';
import { resolvedCart } from './cart';

const checkoutBody = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  paymentMethod: z.enum(['cod', 'bank_transfer']),
});

export function toOrder(order: MockOrder): Order {
  const db = getDb();
  const merchant = db.merchants.get(order.merchantId);
  return {
    id: order.id,
    number: order.number,
    merchantName: merchant?.name ?? '',
    merchantInitials: merchant?.initials ?? '',
    merchantColor: merchant?.color ?? '#4B0082',
    source: order.source,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    deliveryAddress: order.deliveryAddress,
    branchName: order.branchName,
    studentName: order.studentName,
    studentUniversity: order.studentUniversity,
    createdAt: new Date(order.createdAt).toISOString(),
    completedAt: order.completedAt ? new Date(order.completedAt).toISOString() : null,
    hasReceipt: order.status === 'completed',
    siblingNumbers: [...db.orders.values()]
      .filter((other) => other.checkoutId && other.checkoutId === order.checkoutId)
      .filter((other) => other.id !== order.id)
      .map((other) => other.number),
  };
}

/** Prices come from the catalogue. Anything the client sent about money is never read. */
export async function placeOrder(request: Request): Promise<Response> {
  const user = requireVerified(request);
  const parsed = checkoutBody.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) throw invalid('Check your delivery details and try again.');
  const body = parsed.data;

  const lines = resolvedCart(user);
  if (lines.length === 0) throw invalid('Your cart is empty.');

  const db = getDb();
  for (const merchantId of new Set(lines.map(({ deal }) => deal.merchantId))) {
    if (db.merchants.get(merchantId)?.status !== 'active') {
      throw new HttpError(
        409,
        API_ERROR_CODES.merchantOnHold,
        "One of these shops isn't taking orders right now. Remove it and try again.",
      );
    }
  }

  const checkoutId = nextId('checkout');
  const created: MockOrder[] = [];
  for (const merchantId of new Set(lines.map(({ deal }) => deal.merchantId))) {
    const group = lines.filter(({ deal }) => deal.merchantId === merchantId);
    const items = group.map(({ deal, option, line }) => ({
      dealId: deal.id,
      title: `${deal.brand.name}: ${option.label}`,
      regularPrice: option.regularPrice,
      studentPrice: option.studentPrice,
      quantity: line.quantity,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.regularPrice * item.quantity, 0);
    const food = items.reduce((sum, item) => sum + item.studentPrice * item.quantity, 0);
    const deliveryFee = group[0]?.deal.deliveryFee ?? 0;

    const order: MockOrder = {
      id: nextId('order'),
      number: transactionId(),
      studentId: user.id,
      studentName: user.name,
      studentUniversity: universityName(user),
      merchantId,
      source: 'online',
      claimId: null,
      items,
      subtotal,
      discount: subtotal - food,
      deliveryFee,
      total: food + deliveryFee,
      paymentMethod: body.paymentMethod,
      status: 'placed',
      deliveryAddress: `${body.address}, ${body.city}`,
      branchName: null,
      checkoutId,
      createdAt: Date.now(),
      completedAt: null,
    };
    db.orders.set(order.id, order);
    created.push(order);
  }

  user.cart = [];
  return ok({ orderId: created[0]?.id }, 201);
}

function ownOrder(user: MockUser, id: string): MockOrder {
  const order = getDb().orders.get(id);
  if (!order || order.studentId !== user.id) throw notFound("We couldn't find that order.");
  return order;
}

export function listOrders(request: Request): Response {
  const user = requireUser(request);
  const orders = [...getDb().orders.values()]
    .filter((order) => order.studentId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  return ok(orders.map(toOrder));
}

export function getOrder(request: Request, id: string): Response {
  return ok(toOrder(ownOrder(requireUser(request), id)));
}

export async function getReceipt(request: Request, id: string): Promise<Response> {
  const order = ownOrder(requireUser(request), id);
  if (order.status !== 'completed') throw notFound('This receipt is not ready yet.');
  const merchant = getDb().merchants.get(order.merchantId);
  if (!merchant) throw notFound();
  const bytes = await buildReceipt(order, merchant);
  return new Response(Buffer.from(bytes), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="myperkify-${order.number}.pdf"`,
    },
  });
}
