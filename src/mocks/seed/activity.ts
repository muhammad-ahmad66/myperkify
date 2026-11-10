import type { MockDb, MockMerchant, MockOrder, MockUser } from '../db';
import { blankUser } from '../db';
import { DEALS } from './deals';

/** [SAMPLE] Fictional accounts and history, so staff screens have something to show. */

export const DEMO_ACCOUNTS = {
  owner: { id: 'user_owner', name: 'Sana Malik', email: 'owner@crustandco.example' },
  cashier: { id: 'user_cashier', name: 'Bilal Ahmed', email: 'cashier@crustandco.example' },
  admin: { id: 'user_admin', name: 'Zainab Ali', email: 'admin@myperkify.example' },
};

export const DEMO_MERCHANT_ID = 'crust-and-co';

export function seedMerchants(db: MockDb): void {
  for (const deal of DEALS) {
    if (db.merchants.has(deal.merchantId)) continue;
    const merchant: MockMerchant = {
      id: deal.merchantId,
      slug: deal.merchantId,
      name: deal.brand.name,
      initials: deal.brand.initials,
      color: deal.brand.color,
      categoryId: deal.categoryId,
      description: deal.summaryLine,
      status: 'active',
      ownerName: 'Sample owner',
      ownerEmail: `owner@${deal.merchantId}.example`,
      phone: '3000000000',
      branches: deal.branches,
      branchesNote: `${deal.branches.length || 1} location`,
      rejectionReason: null,
      createdAt: Date.now() - 40 * DAY,
    };
    db.merchants.set(merchant.id, merchant);
  }

  db.merchants.set('kettle-corner', {
    id: 'kettle-corner',
    slug: 'kettle-corner',
    name: 'Kettle Corner',
    initials: 'KC',
    color: '#0E8A62',
    categoryId: 'food',
    description: 'Tea and snacks near the Punjab University hostels.',
    status: 'applied',
    ownerName: 'Usman Tariq',
    ownerEmail: 'usman@kettlecorner.example',
    phone: '3001234567',
    branches: [],
    branchesNote: '1 branch, New Campus',
    rejectionReason: null,
    createdAt: Date.now() - DAY,
  });
}

export const DAY = 24 * 60 * 60 * 1000;

function staff(id: string, patch: Partial<MockUser>): MockUser {
  return { ...blankUser(id), status: 'verified', ...patch };
}

export function seedStaff(db: MockDb): void {
  const { owner, cashier, admin } = DEMO_ACCOUNTS;
  db.users.set(
    owner.id,
    staff(owner.id, { ...owner, role: 'merchant_owner', merchantId: DEMO_MERCHANT_ID }),
  );
  db.users.set(
    cashier.id,
    staff(cashier.id, {
      ...cashier,
      role: 'cashier',
      merchantId: DEMO_MERCHANT_ID,
      branchId: '3-dha',
    }),
  );
  db.users.set(admin.id, staff(admin.id, { ...admin, role: 'admin' }));

  const reviewing: [string, string, string][] = [
    ['Hira Nadeem', 'hira.n@example.com', 'uet'],
    ['Omar Farooq', 'omar.f@example.com', 'gcu'],
  ];
  reviewing.forEach(([name, email, universityId], index) => {
    const id = `user_review_${index}`;
    db.users.set(id, {
      ...blankUser(id),
      name,
      email,
      universityId,
      status: 'pending',
      method: 'card',
      submittedAt: new Date(Date.now() - (index + 1) * 3 * 60 * 60 * 1000).toISOString(),
    });
  });
}

/** Past orders for the demo store, leaving its balance close to the threshold. */
export function seedActivity(db: MockDb): void {
  const rate = db.settings.commissionRate;
  const large = { regular: 2400, student: 1800, title: 'Large 14"' };
  const medium = { regular: 1800, student: 1350, title: 'Medium 12"' };
  const history = [
    { item: large, name: 'Ali Raza', uni: 'LUMS', daysAgo: 6 },
    { item: medium, name: 'Maha Iqbal', uni: 'FAST-NUCES', daysAgo: 5 },
    { item: large, name: 'Taha Khan', uni: 'UMT', daysAgo: 5 },
    { item: large, name: 'Noor Fatima', uni: 'UCP', daysAgo: 4 },
    { item: medium, name: 'Saad Hussain', uni: 'UET', daysAgo: 3 },
    { item: large, name: 'Areeba Shah', uni: 'GCU', daysAgo: 2 },
    { item: large, name: 'Hamid Javed', uni: 'LUMS', daysAgo: 1 },
    { item: large, name: 'Iqra Saeed', uni: 'NUST', daysAgo: 0 },
    { item: medium, name: 'Fahad Noor', uni: 'COMSATS', daysAgo: 0 },
  ];

  history.forEach(({ item, name, uni, daysAgo }, index) => {
    const at = Date.now() - daysAgo * DAY - 60 * 60 * 1000;
    const number = `MP-24${String(1000 + index)}`;
    const id = `order_seed_${index}`;
    const order: MockOrder = {
      id,
      number,
      studentId: 'user_sample',
      studentName: name,
      studentUniversity: uni,
      merchantId: DEMO_MERCHANT_ID,
      source: 'in_store',
      claimId: null,
      items: [
        {
          dealId: '3',
          title: item.title,
          regularPrice: item.regular,
          studentPrice: item.student,
          quantity: 1,
        },
      ],
      subtotal: item.regular,
      discount: item.regular - item.student,
      deliveryFee: 0,
      total: item.student,
      paymentMethod: 'cash_counter',
      status: 'completed',
      deliveryAddress: null,
      branchName: 'DHA Phase 5',
      checkoutId: null,
      createdAt: at,
      completedAt: at,
    };
    db.orders.set(id, order);
    db.ledger.push({
      id: `ledger_seed_${index}`,
      merchantId: DEMO_MERCHANT_ID,
      orderId: id,
      orderNumber: number,
      type: 'commission',
      amount: Math.round(order.total * rate),
      saleValue: order.total,
      rateSnapshot: rate,
      createdAt: at,
    });
  });
}
