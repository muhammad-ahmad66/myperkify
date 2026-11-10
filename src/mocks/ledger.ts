import { getDb, nextId, type MockMerchant, type MockOrder } from './db';

/** Sum of commission minus confirmed settlements. Entries are append-only. */
export function balanceOf(merchantId: string): number {
  return getDb()
    .ledger.filter((entry) => entry.merchantId === merchantId)
    .reduce((total, entry) => total + entry.amount, 0);
}

function refreshHold(merchant: MockMerchant): void {
  const { threshold } = getDb().settings;
  const balance = balanceOf(merchant.id);
  if (merchant.status === 'active' && balance >= threshold) merchant.status = 'on_hold';
  if (merchant.status === 'on_hold' && balance < threshold) merchant.status = 'active';
}

export function transactionId(): string {
  return `MP-${240000 + Math.floor(Math.random() * 9999)}`;
}

/**
 * The one way an order completes. The rate is stored on the entry so a later change cannot
 * rewrite history. The base and rounding are D-05: discounted price without delivery, rounded
 * to the nearest rupee, until the client decides.
 */
export function completeOrder(order: MockOrder): void {
  if (order.status === 'completed') return;
  const db = getDb();
  order.status = 'completed';
  order.completedAt = Date.now();

  const saleValue = order.total - order.deliveryFee;
  db.ledger.push({
    id: nextId('ledger'),
    merchantId: order.merchantId,
    orderId: order.id,
    orderNumber: order.number,
    type: 'commission',
    amount: Math.round(saleValue * db.settings.commissionRate),
    saleValue,
    rateSnapshot: db.settings.commissionRate,
    createdAt: Date.now(),
  });

  const merchant = db.merchants.get(order.merchantId);
  if (merchant) refreshHold(merchant);
}

export function applySettlement(merchantId: string, amount: number): void {
  const db = getDb();
  db.ledger.push({
    id: nextId('ledger'),
    merchantId,
    orderId: null,
    orderNumber: null,
    type: 'settlement',
    amount: -amount,
    saleValue: null,
    rateSnapshot: null,
    createdAt: Date.now(),
  });
  const merchant = db.merchants.get(merchantId);
  if (merchant) refreshHold(merchant);
}
