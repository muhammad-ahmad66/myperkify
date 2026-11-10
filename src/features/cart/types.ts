export type CartLine = {
  id: string;
  dealSlug: string;
  title: string;
  image: string | null;
  optionLabel: string;
  regularPrice: number;
  studentPrice: number;
  quantity: number;
  maxQuantity: number;
};

export type CartGroup = {
  merchantId: string;
  merchantName: string;
  initials: string;
  color: string;
  deliveryFee: number;
  lines: CartLine[];
};

export type CartSummary = {
  itemCount: number;
  groups: CartGroup[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

export type AddToCartInput = {
  dealId: string;
  optionId: string;
  quantity: number;
};
