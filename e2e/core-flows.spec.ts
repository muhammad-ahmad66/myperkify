import { expect, test, type Page } from '@playwright/test';

const DEAL = '/deals/crust-and-co-large-pizzas';
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

function setNetwork(page: Page, mode: 'normal' | 'slow' | 'failing') {
  return page.request.post('/api/mock/dev/network', { data: { mode } });
}

async function resetAndViewAs(page: Page, as?: 'verified' | 'owner') {
  await page.request.post('/api/mock/dev/reset');
  if (as) await page.request.post('/api/mock/dev/viewer', { data: { as } });
}

test('a visitor receives no student price in the page HTML (F-103)', async ({ page }) => {
  await resetAndViewAs(page);
  const response = await page.request.get(DEAL);
  const html = await response.text();
  expect(html).not.toContain('studentPrice');
  // Student prices of the Medium and the combo. PKR 1,800 is left out on purpose: it is the
  // student price of the Large, and also the Medium's regular price, which may be shown.
  expect(html).not.toContain('PKR 1,350');
  expect(html).not.toContain('PKR 2,100');
  expect(html).toContain('PKR 2,400');
});

test('a verified student claims in store and the cashier approves', async ({ page }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await page.locator('aside').getByRole('button', { name: 'Claim in store' }).click();

  const voucher = page.getByRole('dialog');
  await expect(voucher.getByText('Show this code to the cashier')).toBeVisible();

  const state = await (await page.request.get('/api/mock/dev/state')).json();
  await page.request.post(`/api/mock/dev/claims/${state.data.pendingClaimId}/approve`);

  await expect(voucher.getByText('Paid & redeemed')).toBeVisible({ timeout: 8000 });
});

test('a student verifies with a university email', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/get-verified');
  await page.getByLabel('Full name').fill('Ayesha Khan');
  await page.getByLabel('University email').fill('ayesha.k@lums.edu.pk');
  await page.locator('#terms').click();
  await page.getByRole('button', { name: 'Send my code' }).click();

  await expect(page.getByText('Check your uni inbox')).toBeVisible();
  const state = await (await page.request.get('/api/mock/dev/state')).json();
  await page.getByLabel('Verification code').fill(state.data.verificationCode);

  await expect(page.getByText("You're in. Every student price is unlocked.")).toBeVisible();
});

test('filters fetch over the network and show a refreshing state', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/deals');

  const request = page.waitForResponse('**/api/mock/deals?*mode=online*');
  await page.getByRole('button', { name: 'Online', exact: true }).click();
  const response = await request;

  expect(response.status()).toBe(200);
  expect(await response.json()).toHaveProperty('data');
  await expect(page.getByText('Threadline')).toBeVisible();
});

test('a failed load shows an error with a working retry', async ({ page }) => {
  await resetAndViewAs(page);
  await setNetwork(page, 'failing');
  await page.goto('/deals');
  await page.getByRole('button', { name: 'Online', exact: true }).click();

  const retry = page.getByRole('button', { name: 'Try again' });
  await expect(retry).toBeVisible({ timeout: 15000 });
  await setNetwork(page, 'normal');
  await retry.click();

  await expect(page.getByText('Threadline')).toBeVisible({ timeout: 15000 });
});

test('a failed action shows a toast, and a saved heart rolls back', async ({ page }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await setNetwork(page, 'failing');

  const heart = page.getByRole('button', { name: 'Save Crust & Co.' });
  await heart.click();
  await expect(page.getByText('MyPerkify is busy right now')).toBeVisible();
  await expect(heart).toHaveAttribute('aria-pressed', 'false');
  await setNetwork(page, 'normal');
});

test('an offline action fails fast and frees its button', async ({ page, context }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await page.locator('aside').getByRole('button', { name: 'Delivery' }).click();
  const add = page.locator('aside').getByRole('button', { name: /Add to cart/ });

  await context.setOffline(true);
  await add.click();
  await expect(page.getByText("You're offline. Check your connection")).toBeVisible();
  await expect(page.getByText("Anything you've typed is safe.")).toBeVisible();
  await expect(add).toBeEnabled({ timeout: 1000 });
  await context.setOffline(false);
});

test('a slow claim shows what is happening', async ({ page }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await setNetwork(page, 'slow');
  await page.locator('aside').getByRole('button', { name: 'Claim in store' }).click();

  await expect(
    page.locator('aside').getByRole('button', { name: /Getting your code/ }),
  ).toBeDisabled();
  await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText('Show this code')).toBeVisible({ timeout: 8000 });
  await setNetwork(page, 'normal');
});

test('the voucher says so when the connection drops', async ({ page }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await page.locator('aside').getByRole('button', { name: 'Claim in store' }).click();
  await expect(page.getByRole('dialog').getByText('Show this code')).toBeVisible();

  await setNetwork(page, 'failing');
  await expect(page.getByText('Connection lost. Your code still works.')).toBeVisible({
    timeout: 8000,
  });
  await setNetwork(page, 'normal');
  await expect(page.getByText('Waiting for the cashier to approve')).toBeVisible({ timeout: 8000 });
});

test('a wrong code shows a helpful message next to the field', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/get-verified');
  await page.getByLabel('Full name').fill('Ayesha Khan');
  await page.getByLabel('University email').fill('ayesha.k@lums.edu.pk');
  await page.locator('#terms').click();
  await page.getByRole('button', { name: 'Send my code' }).click();
  await expect(page.getByText('Code sent to ayesha.k@lums.edu.pk')).toBeVisible();

  await page.getByLabel('Verification code').fill('000000');
  await expect(page.getByText("That code doesn't match.", { exact: false })).toBeVisible();
});

test("the client's end-to-end test passes in one run", async ({ browser }) => {
  const reset = await browser.newContext({ baseURL: BASE_URL });
  await reset.request.post('/api/mock/dev/reset');

  // 1 and 2. A student registers and is verified by an admin reviewing their card.
  const student = await browser.newContext({ baseURL: BASE_URL });
  const phone = await student.newPage();
  await phone.goto('/get-verified');
  await phone.getByLabel('Full name').fill('Ayesha Khan');
  await phone.getByRole('radio', { name: /Student card photo/ }).click();
  await phone.getByLabel('Email for updates').fill('ayesha@example.com');
  await phone.locator('#university').click();
  await phone.getByRole('option', { name: /LUMS/ }).click();
  await phone.locator('#terms').click();
  await phone.getByRole('button', { name: 'Continue to card upload' }).click();
  await phone.locator('#student-card').setInputFiles({
    name: 'card.png',
    mimeType: 'image/png',
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  });
  await phone.getByRole('button', { name: 'Send for review' }).click();
  await expect(phone.getByText("We're checking your card")).toBeVisible();

  const admin = await browser.newContext({ baseURL: BASE_URL });
  await admin.request.post('/api/mock/dev/viewer', { data: { as: 'admin' } });
  const review = await admin.newPage();
  await review.goto('/admin/verifications');
  const card = review.getByRole('article').filter({ hasText: 'Ayesha Khan' });
  await card.getByRole('button', { name: 'Approve' }).click();
  await expect(phone.getByText("You're in. Every student price is unlocked.")).toBeVisible({
    timeout: 12000,
  });

  // 3. The student claims an in-store deal.
  await phone.goto(DEAL);
  await phone.locator('aside').getByRole('button', { name: 'Claim in store' }).click();
  const voucher = phone.getByRole('dialog');
  await expect(voucher.getByText('Show this code to the cashier')).toBeVisible();
  const label = await voucher.getByRole('img', { name: /^Code / }).getAttribute('aria-label');
  const code = (label ?? '').replace(/\D/g, '');

  // 4. The cashier sees the claim appear by itself and approves it.
  const staff = await browser.newContext({ baseURL: BASE_URL });
  await staff.request.post('/api/mock/dev/viewer', { data: { as: 'cashier' } });
  const counter = await staff.newPage();
  await counter.goto('/store-manager/claims');
  await expect(counter.getByText(code)).toBeVisible();
  await counter.getByRole('button', { name: 'Approve & mark paid' }).click();
  await expect(voucher.getByText('Paid & redeemed')).toBeVisible({ timeout: 8000 });

  // 5. A 5% commission is logged.
  const owner = await browser.newContext({ baseURL: BASE_URL });
  await owner.request.post('/api/mock/dev/viewer', { data: { as: 'owner' } });
  const ledger = await owner.newPage();
  await ledger.goto('/store-manager/ledger');
  await expect(ledger.getByRole('cell', { name: 'PKR 90', exact: true }).first()).toBeVisible();

  // 6. A PDF receipt is delivered.
  const download = phone.waitForEvent('download');
  await voucher.getByRole('link', { name: 'Download PDF receipt' }).click();
  expect((await download).suggestedFilename()).toMatch(/^myperkify-MP-\d+\.pdf$/);
});

test('an order goes from cart to delivered', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: BASE_URL });
  await context.request.post('/api/mock/dev/reset');
  await context.request.post('/api/mock/dev/viewer', { data: { as: 'verified' } });
  const page = await context.newPage();

  await page.goto(DEAL);
  await page.locator('aside').getByRole('button', { name: 'Delivery' }).click();
  await page
    .locator('aside')
    .getByRole('button', { name: /Add to cart/ })
    .click();
  await expect(page.getByText('added to your cart')).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByText('You save PKR 600')).toBeVisible();
  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await page.getByRole('button', { name: /Place order/ }).click();
  await expect(page.getByText('Enter a mobile number the rider can call')).toBeVisible();
  await page.getByLabel('Phone').fill('3001112222');
  await page.getByLabel('Address').fill('Hostel 3, New Campus');
  await page.getByLabel('City').fill('Lahore');
  await page.getByRole('button', { name: /Place order/ }).click();
  await expect(page.getByText('Your order is in.')).toBeVisible();

  const staff = await browser.newContext({ baseURL: BASE_URL });
  await staff.request.post('/api/mock/dev/viewer', { data: { as: 'owner' } });
  const shop = await staff.newPage();
  await shop.goto('/store-manager/orders');
  await shop.getByRole('button', { name: 'Accept order' }).click();
  await shop.getByRole('button', { name: 'To dispatch' }).click();
  await shop.getByRole('button', { name: 'Mark dispatched' }).click();
  await shop.getByRole('button', { name: 'Mark delivered' }).click();
  await expect(shop.getByText('No orders here right now.')).toBeVisible();

  await page.getByRole('link', { name: 'Track your order' }).click();
  await expect(page.getByRole('link', { name: 'Download PDF receipt' })).toBeVisible();
});

test('the homepage is short: hero, deals, how it works', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('student price');
  await expect(page.getByRole('heading', { name: 'Student deals' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(8);
  await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(2);
});

test('the theme defaults to light, and dark is remembered', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  await page.goto('/deals');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('staff pages turn away the wrong people', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/store-manager');
  await expect(page).toHaveURL(/sign-in/);
  await page.goto('/admin/verifications');
  await expect(page).toHaveURL(/sign-in/);

  await page.request.post('/api/mock/dev/viewer', { data: { as: 'cashier' } });
  await page.goto('/store-manager/ledger');
  await expect(page).toHaveURL(/store-manager\/claims/);
  await page.goto('/admin/verifications');
  await expect(page).toHaveURL(/sign-in|store-manager/);
});

test('a student signs in with an emailed code', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('nobody@example.com');
  await page.getByRole('button', { name: 'Send my code' }).click();
  await expect(page.getByText("We couldn't find an account")).toBeVisible();

  await page.getByLabel('Email').fill('owner@crustandco.example');
  await page.getByRole('button', { name: 'Send my code' }).click();
  await expect(page.getByText('Check your inbox')).toBeVisible();
  const state = await (await page.request.get('/api/mock/dev/state')).json();
  await page.getByLabel('Verification code').fill(state.data.verificationCode);
  await expect(page).toHaveURL(/store-manager$/);
});

test('pages hydrate without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await resetAndViewAs(page);
  for (const path of ['/', '/deals', DEAL, '/business']) {
    await page.goto(path, { waitUntil: 'networkidle' });
  }
  expect(errors).toEqual([]);
});

test('the header menu follows the role', async ({ page }) => {
  await resetAndViewAs(page, 'verified');
  await page.goto('/');
  await page.getByRole('button', { name: 'Your account' }).click();
  await expect(page.getByRole('menuitem', { name: 'Saved deals' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Settlements' })).toHaveCount(0);
  await page.getByRole('menuitem', { name: 'Orders and receipts' }).click();
  await expect(page).toHaveURL(/account#orders/);
});

test('an owner adds, edits and removes a branch, and students see it', async ({ page }) => {
  await resetAndViewAs(page, 'owner');
  await page.goto('/store-manager/settings');

  await page.getByRole('button', { name: 'Add a branch' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Add branch' }).click();
  await expect(dialog.getByText('Name this branch, like Gulberg III.')).toBeVisible();
  await dialog.getByLabel('Branch name').fill('Model Town');
  await dialog.getByLabel('City').click();
  await page.getByRole('option', { name: 'Lahore' }).click();
  await dialog.getByLabel('Street address').fill('14 Link Road, Model Town');
  await dialog.getByLabel('Opens at').click();
  await page.getByRole('option', { name: '10:00 am' }).click();
  await dialog.getByLabel('Closes at').click();
  await page.getByRole('option', { name: '10:00 pm' }).click();
  await dialog.getByRole('button', { name: 'Add branch' }).click();
  await expect(page.getByText('10:00 am to 10:00 pm')).toBeVisible();

  const student = await page.context().browser()!.newContext({ baseURL: BASE_URL });
  const shopper = await student.newPage();
  await shopper.goto(DEAL);
  await expect(shopper.getByText('14 Link Road, Model Town')).toBeVisible();
  await student.close();

  await page.getByRole('button', { name: 'Edit Model Town' }).click();
  await dialog.getByLabel('Branch name').fill('Model Town Link');
  await dialog.getByRole('button', { name: 'Save branch' }).click();
  await expect(page.getByRole('button', { name: 'Edit Model Town Link' })).toBeVisible();

  await page.getByRole('button', { name: 'Remove Model Town Link' }).click();
  await dialog.getByRole('button', { name: 'Remove branch' }).click();
  await expect(page.getByRole('button', { name: 'Edit Model Town Link' })).toHaveCount(0);

  // The demo cashier works at DHA Phase 5, so that branch cannot go.
  await page.getByRole('button', { name: 'Remove DHA Phase 5' }).click();
  await dialog.getByRole('button', { name: 'Remove branch' }).click();
  await expect(page.getByText('Bilal Ahmed works at this branch.', { exact: false })).toBeVisible();
});

test('an owner adds and moves cashiers, and a new cashier signs in', async ({ page, browser }) => {
  await resetAndViewAs(page, 'owner');
  await page.goto('/store-manager/settings');
  const dialog = page.getByRole('dialog');

  async function choose(label: string, option: string) {
    await dialog.getByLabel(label).click();
    await page.getByRole('option', { name: option }).click();
  }

  await page.getByRole('button', { name: 'Add a cashier' }).click();
  await dialog.getByLabel('Full name').fill('Hamza Ali');
  await dialog.getByLabel('Email').fill('cashier@crustandco.example');
  await choose('Branch', 'Gulberg III');
  await dialog.getByRole('button', { name: 'Add cashier' }).click();
  await expect(dialog.getByText('That email already has an account.')).toBeVisible();
  await dialog.getByLabel('Email').fill('hamza@crustandco.example');
  await dialog.getByRole('button', { name: 'Add cashier' }).click();
  await expect(page.getByRole('button', { name: 'Edit Hamza Ali' })).toBeVisible();

  // Moving Bilal frees DHA Phase 5, so it can now be removed.
  await page.getByRole('button', { name: 'Edit Bilal Ahmed' }).click();
  await choose('Branch', 'Johar Town');
  await dialog.getByRole('button', { name: 'Save changes' }).click();
  await page.getByRole('button', { name: 'Remove DHA Phase 5' }).click();
  await dialog.getByRole('button', { name: 'Remove branch' }).click();
  await expect(page.getByRole('button', { name: 'Edit DHA Phase 5' })).toHaveCount(0);

  const counter = await browser.newContext({ baseURL: BASE_URL });
  const till = await counter.newPage();
  await till.goto('/sign-in');
  await till.getByLabel('Email').fill('hamza@crustandco.example');
  await till.getByRole('button', { name: 'Send my code' }).click();
  await expect(till.getByText('Check your inbox')).toBeVisible();
  const state = await (await till.request.get('/api/mock/dev/state')).json();
  await till.getByLabel('Verification code').fill(state.data.verificationCode);
  await expect(till).toHaveURL(/store-manager\/claims/);
  await counter.close();

  await page.getByRole('button', { name: 'Remove Hamza Ali' }).click();
  await dialog.getByRole('button', { name: 'Remove cashier' }).click();
  await expect(page.getByRole('button', { name: 'Edit Hamza Ali' })).toHaveCount(0);
});

test('the voucher shows a rolling QR, and the cashier can open the scanner', async ({
  page,
  browser,
}) => {
  await resetAndViewAs(page, 'verified');
  await page.goto(DEAL);
  await page.locator('aside').getByRole('button', { name: 'Claim in store' }).click();
  const voucher = page.getByRole('dialog');
  await expect(voucher.getByRole('img', { name: 'QR code for the cashier to scan' })).toBeVisible();
  // The voucher must fit the screen, phones included.
  const box = await voucher.locator('[role="dialog"], :scope').first().boundingBox();
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);

  const counter = await browser.newContext({ baseURL: BASE_URL });
  await counter.request.post('/api/mock/dev/viewer', { data: { as: 'cashier' } });
  const till = await counter.newPage();
  await till.goto('/store-manager/claims');
  await till.getByRole('button', { name: 'Scan QR' }).click();
  await expect(till.getByRole('dialog').getByText('Scan a student pass')).toBeVisible();
  await till.getByRole('button', { name: 'Close scanner' }).click();
  await counter.close();
});

test('the directory filters, searches and clears', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/deals');
  await expect(page.getByRole('status').filter({ hasText: '13 deals' })).toBeVisible();

  await page.getByRole('button', { name: 'Fitness', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '1 deal in Fitness' })).toBeVisible();
  await expect(page).toHaveURL(/category=fitness/);
  await page.getByRole('button', { name: 'Everything' }).click();
  await expect(page.getByRole('status').filter({ hasText: '13 deals' })).toBeVisible();
  await expect(page).not.toHaveURL(/category/);

  const search = page.getByRole('searchbox', { name: 'Search deals' });
  await search.fill('nothing like this');
  await expect(page.getByRole('status').filter({ hasText: '0 deals' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('status').filter({ hasText: '13 deals' })).toBeVisible();
  await expect(search).toHaveValue('');
  await expect(page).not.toHaveURL(/q=/);

  await page.getByRole('searchbox', { name: 'Search deals' }).fill('pizza');
  await expect(page).toHaveURL(/q=pizza/);
  await expect(page.getByRole('status').filter({ hasText: '1 deal' })).toBeVisible();
});

test('a business applies through every step', async ({ page }) => {
  await resetAndViewAs(page);
  await page.goto('/business/register');
  const proceed = page.getByRole('button', { name: 'Continue' });

  async function choose(label: string, option: string) {
    await page.getByLabel(label).click();
    await page.getByRole('option', { name: option }).click();
  }

  // Nothing filled in: the step refuses to move and explains why.
  await proceed.click();
  await expect(page.getByText('Enter the name students will see.')).toBeVisible();

  await page.getByLabel('Business name').fill('Kettle House');
  await choose('Category', 'Food & drink');
  await proceed.click();

  await page.getByLabel('Branch name').fill('New Campus');
  await choose('City', 'Lahore');
  await page.getByLabel('Street address').fill('12 Canal Road, near Hostel 3');
  await page.getByRole('button', { name: 'Add another branch' }).click();
  await expect(page.getByRole('region', { name: 'Branch 2' })).toBeVisible();
  await page.getByRole('button', { name: 'Remove branch 2' }).click();
  await proceed.click();

  await page.getByLabel('Full name').fill('Usman Tariq');
  await page.getByLabel('Work email').fill('usman@kettlehouse.example');
  await page.getByLabel('Mobile number').fill('3001234567');
  await proceed.click();

  await page.locator('#proof-document').setInputFiles({
    name: 'bill.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test'),
  });
  await expect(page.getByText('Tick the box to continue.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Send application' }).click();
  await expect(page.getByText('Tick the box to continue.')).toHaveCount(2);
  await page.locator('#accept-commission').click();
  await page.locator('#accept-terms').click();
  await page.getByRole('button', { name: 'Send application' }).click();

  await expect(page.getByText("We've got your application.")).toBeVisible();
  await expect(page.getByText(/^APP-\d+$/)).toBeVisible();
});

const ALL_PAGES = [
  '/deals',
  '/stores/crust-and-co',
  '/business',
  '/business/register',
  '/sign-in',
  '/about',
  '/help',
  '/contact',
  '/privacy',
  '/terms',
];

for (const path of [...ALL_PAGES, '/', DEAL, '/get-verified']) {
  test(`${path} never scrolls sideways`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
