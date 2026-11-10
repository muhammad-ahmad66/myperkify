export type OrderStatus = 'placed' | 'processing' | 'dispatched' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash_counter' | 'cod' | 'bank_transfer';

export type OrderItem = {
  dealId: string;
  title: string;
  regularPrice: number;
  studentPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: string;
  merchantName: string;
  merchantInitials: string;
  merchantColor: string;
  source: 'in_store' | 'online';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveryAddress: string | null;
  branchName: string | null;
  studentName: string;
  studentUniversity: string;
  createdAt: string;
  completedAt: string | null;
  hasReceipt: boolean;
  siblingNumbers: string[];
};
