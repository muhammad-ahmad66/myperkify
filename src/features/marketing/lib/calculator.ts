import { COMMISSION_RATE, SETTLEMENT_THRESHOLD } from '@/lib/constants';

export type CalculatorResult = {
  sales: number;
  commission: number;
  keep: number;
  ordersBetweenSettlements: number;
};

/** An estimate for shop owners. Real commission is calculated on the server. */
export function calculateEarnings(orders: number, bill: number): CalculatorResult {
  const sales = orders * bill;
  const commission = Math.round(sales * COMMISSION_RATE);
  return {
    sales,
    commission,
    keep: sales - commission,
    ordersBetweenSettlements: Math.ceil(SETTLEMENT_THRESHOLD / (bill * COMMISSION_RATE)),
  };
}
