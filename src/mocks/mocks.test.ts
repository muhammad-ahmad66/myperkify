// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb, resetDb } from './db';
import { handleMockRequest } from './handlers';
import { serveMockRequest } from './network';
import { SESSION_COOKIE } from './session';

const BASE = '/api/mock';
const CRUST = 'crust-and-co-large-pizzas';
let cookie = '';

async function call(method: string, path: string, body?: unknown) {
  const request = new Request(`http://mock.local${BASE}${path}`, {
    method,
    headers: { cookie, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await handleMockRequest(request);
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0] ?? '';
  return { status: response.status, json: await response.json(), text: JSON.stringify };
}

const viewAs = (as: string) => call('POST', '/dev/viewer', { as });
const claimBody = { dealId: '3', optionId: '3-large', branchId: '3-dha' };

beforeEach(() => {
  resetDb();
  cookie = '';
  vi.useRealTimers();
});

describe('role gating (F-103)', () => {
  it.each([['/deals?limit=20'], [`/deals/${CRUST}`], ['/deals/search?q=pizza']])(
    'sends no student price to a visitor from %s',
    async (path) => {
      const { json } = await call('GET', path);
      const payload = JSON.stringify(json);
      expect(payload).not.toContain('studentPrice');
      expect(payload).not.toContain('"unlocked"');
    },
  );

  it('also locks prices for a student waiting on review', async () => {
    await viewAs('pending');
    const { json } = await call('GET', `/deals/${CRUST}`);
    expect(JSON.stringify(json)).not.toContain('studentPrice');
  });

  it('sends student prices to a verified student', async () => {
    await viewAs('verified');
    const { json } = await call('GET', `/deals/${CRUST}`);
    expect(json.data.options[0].pricing).toEqual({
      access: 'unlocked',
      regularPrice: 2400,
      studentPrice: 1800,
    });
  });

  it('rejects claims and cart writes from unverified users', async () => {
    expect((await call('POST', '/claims', claimBody)).status).toBe(401);
    await viewAs('pending');
    const claim = await call('POST', '/claims', claimBody);
    expect(claim.status).toBe(403);
    expect(claim.json.error.code).toBe('NOT_VERIFIED');
    const cart = await call('POST', '/cart/items', { ...claimBody, quantity: 1 });
    expect(cart.status).toBe(403);
  });
});

describe('claims (F-301 to F-305)', () => {
  beforeEach(async () => {
    await viewAs('verified');
  });

  it('issues a 4-digit server code with a 5-minute expiry', async () => {
    const before = Date.now();
    const { status, json } = await call('POST', '/claims', claimBody);
    expect(status).toBe(201);
    expect(json.data.code).toMatch(/^\d{4}$/);
    const lifetime = new Date(json.data.expiresAt).getTime() - before;
    expect(lifetime).toBeGreaterThanOrEqual(299_000);
    expect(lifetime).toBeLessThanOrEqual(301_000);
  });

  it('blocks a closed branch', async () => {
    const { status, json } = await call('POST', '/claims', { ...claimBody, branchId: '3-johar' });
    expect(status).toBe(409);
    expect(json.error.code).toBe('BRANCH_CLOSED');
  });

  it('returns the same live claim on a repeat request', async () => {
    const first = await call('POST', '/claims', claimBody);
    const second = await call('POST', '/claims', claimBody);
    expect(second.json.data.id).toBe(first.json.data.id);
    expect(second.json.data.code).toBe(first.json.data.code);
  });

  it('approves once, even when approved twice', async () => {
    const { json } = await call('POST', '/claims', claimBody);
    const path = `/dev/claims/${json.data.id}/approve`;
    await call('POST', path);
    const first = await call('GET', `/claims/${json.data.id}`);
    expect(first.json.data.status).toBe('redeemed');
    await call('POST', path);
    const second = await call('GET', `/claims/${json.data.id}`);
    expect(second.json.data.transactionId).toBe(first.json.data.transactionId);
  });

  it('expires on server time and refuses approval afterwards', async () => {
    const { json } = await call('POST', '/claims', claimBody);
    vi.useFakeTimers({ now: Date.now() + 301_000 });
    const read = await call('GET', `/claims/${json.data.id}`);
    expect(read.json.data.status).toBe('expired');
    const approve = await call('POST', `/dev/claims/${json.data.id}/approve`);
    expect(approve.json.error.code).toBe('CODE_EXPIRED');
  });

  it('enforces the daily limit, and an expired claim does not count', async () => {
    const first = await call('POST', '/claims', claimBody);
    vi.useFakeTimers({ now: Date.now() + 301_000 });
    await call('GET', `/claims/${first.json.data.id}`);
    vi.useRealTimers();

    const second = await call('POST', '/claims', claimBody);
    expect(second.status).toBe(201);
    await call('POST', `/dev/claims/${second.json.data.id}/approve`);
    const third = await call('POST', '/claims', claimBody);
    expect(third.json.error.code).toBe('LIMIT_REACHED');
  });

  it("hides another student's claim", async () => {
    const { json } = await call('POST', '/claims', claimBody);
    await viewAs('verified');
    expect((await call('GET', `/claims/${json.data.id}`)).status).toBe(404);
  });
});

describe('verification (F-101, F-104, F-105)', () => {
  const account = {
    name: 'Ayesha Khan',
    universityId: 'lums',
    method: 'email',
    email: 'ayesha.k@lums.edu.pk',
    acceptedTerms: true,
  };

  it('verifies with the emailed code and rejects a wrong one', async () => {
    await call('POST', '/verification/account', account);
    const wrong = await call('POST', '/verification/code', { code: '000000' });
    expect(wrong.json.error.code).toBe('CODE_MISMATCH');

    const user = [...getDb().users.values()].find((entry) => entry.email === account.email)!;
    const right = await call('POST', '/verification/code', { code: user.verificationCode });
    expect(right.json.data.verification.status).toBe('verified');
  });

  it('repeats the personal email check on the server', async () => {
    const { status, json } = await call('POST', '/verification/account', {
      ...account,
      email: 'ayesha@gmail.com',
    });
    expect(status).toBe(422);
    expect(json.error.fields.email).toMatch(/personal email/);
  });

  it('refuses an email that already has an account', async () => {
    await call('POST', '/verification/account', account);
    cookie = '';
    const { status, json } = await call('POST', '/verification/account', account);
    expect(status).toBe(409);
    expect(json.error.code).toBe('EMAIL_TAKEN');
  });

  it('judges an upload by its bytes rather than its name or type', async () => {
    await call('POST', '/verification/account', { ...account, method: 'card' });
    const form = new FormData();
    form.append('card', new File(['not an image'], 'card.jpg', { type: 'image/jpeg' }));
    const request = new Request(`http://mock.local${BASE}/verification/card`, {
      method: 'POST',
      headers: { cookie },
      body: form,
    });
    const response = await handleMockRequest(request);
    expect(response.status).toBe(422);
  });
});

describe('cashier approval and commission (F-304, F-601)', () => {
  async function pendingClaim() {
    await viewAs('verified');
    return (await call('POST', '/claims', claimBody)).json.data;
  }

  it('shows the cashier their own branch and logs 5% once, even on a double tap', async () => {
    const claim = await pendingClaim();
    const studentCookie = cookie;
    const before = getDb().ledger.length;

    await viewAs('cashier');
    const board = await call('GET', '/merchant/claims');
    expect(board.json.data.pending[0].code).toBe(claim.code);

    await call('POST', `/merchant/claims/${claim.id}/approve`);
    await call('POST', `/merchant/claims/${claim.id}/approve`);

    const added = getDb().ledger.slice(before);
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ amount: 90, saleValue: 1800, rateSnapshot: 0.05 });

    cookie = studentCookie;
    const read = await call('GET', `/claims/${claim.id}`);
    expect(read.json.data.status).toBe('redeemed');
    expect(read.json.data.orderId).toBeTruthy();
  });

  it('stops a cashier from another branch', async () => {
    await viewAs('verified');
    const claim = await call('POST', '/claims', { ...claimBody, branchId: '3-gulberg' });
    await viewAs('cashier');
    const approve = await call('POST', `/merchant/claims/${claim.json.data.id}/approve`);
    expect(approve.status).toBe(404);
  });

  it('stops students and cashiers reaching owner and admin data', async () => {
    await viewAs('verified');
    expect((await call('GET', '/merchant/claims')).status).toBe(403);
    await viewAs('cashier');
    expect((await call('GET', '/merchant/ledger')).status).toBe(403);
    await viewAs('owner');
    expect((await call('GET', '/admin/verifications')).status).toBe(403);
  });

  it('holds a store at the threshold, then lifts it after settlement (F-603, F-604)', async () => {
    const claim = await pendingClaim();
    const studentCookie = cookie;
    getDb().settings.threshold = 1;
    await viewAs('cashier');
    await call('POST', `/merchant/claims/${claim.id}/approve`);
    expect(getDb().merchants.get('crust-and-co')?.status).toBe('on_hold');

    cookie = studentCookie;
    const blocked = await call('POST', '/claims', { ...claimBody, optionId: '3-medium' });
    expect(blocked.json.error.code).toBe('MERCHANT_ON_HOLD');
    expect(blocked.json.error.message).not.toMatch(/commission|balance/i);

    await viewAs('owner');
    await call('POST', '/merchant/settlements', { reference: 'TRX-1234' });
    await viewAs('admin');
    const { settlements } = (await call('GET', '/admin/settlements')).json.data;
    await call('POST', `/admin/settlements/${settlements[0].id}`, { decision: 'confirm' });

    expect(getDb().merchants.get('crust-and-co')?.status).toBe('active');
  });
});

describe('admin decisions (F-801)', () => {
  it('unlocks prices when a card is approved', async () => {
    await viewAs('admin');
    const queue = (await call('GET', '/admin/verifications')).json.data;
    await call('POST', `/admin/verifications/${queue[0].id}`, { decision: 'approve' });
    expect(getDb().users.get(queue[0].id)?.status).toBe('verified');
  });

  it('requires a reason to reject', async () => {
    await viewAs('admin');
    const queue = (await call('GET', '/admin/verifications')).json.data;
    const result = await call('POST', `/admin/verifications/${queue[0].id}`, {
      decision: 'reject',
    });
    expect(result.status).toBe(422);
  });
});

describe('online orders (F-401 to F-404)', () => {
  const address = {
    fullName: 'Ayesha Khan',
    phone: '0300 1112222',
    address: 'Hostel 3, New Campus',
    city: 'Lahore',
    paymentMethod: 'cod',
  };
  const line = { dealId: '3', optionId: '3-large', quantity: 2 };

  it('prices from the server and logs commission only on delivery', async () => {
    await viewAs('verified');
    const cart = await call('POST', '/cart/items', line);
    expect(cart.json.data).toMatchObject({ itemCount: 2, total: 3750, discount: 1200 });

    const placed = await call('POST', '/orders', { ...address, total: 1 });
    const id = placed.json.data.orderId;
    const studentCookie = cookie;
    const order = (await call('GET', `/orders/${id}`)).json.data;
    expect(order).toMatchObject({ total: 3750, deliveryFee: 150, hasReceipt: false });
    const before = getDb().ledger.length;

    await viewAs('owner');
    await call('POST', `/merchant/orders/${id}/status`, { status: 'processing' });
    await call('POST', `/merchant/orders/${id}/status`, { status: 'dispatched' });
    expect(getDb().ledger.length).toBe(before);
    await call('POST', `/merchant/orders/${id}/status`, { status: 'completed' });
    expect(getDb().ledger.at(-1)).toMatchObject({ amount: 180, saleValue: 3600 });

    cookie = studentCookie;
    const receipt = new Request(`http://mock.local${BASE}/orders/${id}/receipt`, {
      headers: { cookie },
    });
    const response = await handleMockRequest(receipt);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(500);
  });

  it('rejects a status that skips a step', async () => {
    await viewAs('verified');
    await call('POST', '/cart/items', line);
    const id = (await call('POST', '/orders', address)).json.data.orderId;
    await viewAs('owner');
    const skipped = await call('POST', `/merchant/orders/${id}/status`, { status: 'completed' });
    expect(skipped.status).toBe(409);
  });
});

describe('deal status', () => {
  it('hides a draft from the public', async () => {
    await viewAs('owner');
    const created = await call('POST', '/merchant/deals', {
      type: 'in_store',
      title: 'Secret pizza',
      description: 'A draft deal nobody should see.',
      categoryId: 'food',
      stampOffer: '10%',
      regularPrice: 1000,
      studentPrice: 900,
      terms: '',
      status: 'draft',
    });
    expect(created.status).toBe(201);
    const list = await call('GET', '/deals?limit=100');
    expect(JSON.stringify(list.json)).not.toContain('Secret pizza');
    await viewAs('owner');
    expect((await call('GET', '/merchant/deals')).json.data.at(-1).title).toBe('Secret pizza');
  });

  it('never lets a student price reach the regular price', async () => {
    await viewAs('owner');
    const created = await call('POST', '/merchant/deals', {
      type: 'in_store',
      title: 'Bad price',
      description: 'A deal with a broken price.',
      categoryId: 'food',
      stampOffer: '10%',
      regularPrice: 1000,
      studentPrice: 1000,
      terms: '',
      status: 'live',
    });
    expect(created.status).toBe(422);
    expect(created.json.error.fields.studentPrice).toMatch(/below/);
  });
});

describe('network behaviour', () => {
  const request = (path: string) => new Request(`http://mock.local${BASE}${path}`);

  it('answers an unknown path with a 404 in the standard error shape', async () => {
    const { status, json } = await call('GET', '/nothing-here');
    expect(status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('rejects a malformed body instead of crashing', async () => {
    await viewAs('verified');
    const { status, json } = await call('POST', '/claims', { dealId: 3 });
    expect(status).toBe(422);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('adds latency to browser requests', async () => {
    const started = Date.now();
    await serveMockRequest(request('/categories'));
    expect(Date.now() - started).toBeGreaterThanOrEqual(190);
  });

  it('fails every browser request in failing mode, except the dev tools', async () => {
    await call('POST', '/dev/network', { mode: 'failing' });
    const failed = await serveMockRequest(request('/categories'));
    expect(failed.status).toBe(503);
    expect((await failed.json()).error.message).toMatch(/busy/);

    const devTool = await serveMockRequest(request('/dev/state'));
    expect(devTool.status).toBe(200);
  });
});

describe('session cookie', () => {
  it('is httpOnly', async () => {
    const request = new Request(`http://mock.local${BASE}/dev/viewer`, {
      method: 'POST',
      body: JSON.stringify({ as: 'verified' }),
    });
    const response = await handleMockRequest(request);
    const header = response.headers.get('set-cookie') ?? '';
    expect(header).toContain(SESSION_COOKIE);
    expect(header).toContain('HttpOnly');
  });
});
