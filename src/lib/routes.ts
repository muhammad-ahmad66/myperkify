/**
 * Every internal link goes through here. Pages use these names, so a route only ever changes
 * in one place.
 */
export const ROUTES = {
  home: '/',
  deals: '/deals',
  deal: (slug: string) => `/deals/${slug}`,
  store: (slug: string) => `/stores/${slug}`,
  howItWorks: '/#how',

  getVerified: '/get-verified',
  getVerifiedByCard: '/get-verified?method=card',
  signIn: '/sign-in',

  cart: '/cart',
  checkout: '/checkout',
  orderConfirmed: (id: string) => `/orders/${id}/confirmed`,
  account: '/account',
  accountOrder: (id: string) => `/account/orders/${id}`,
  myPass: '/account#my-pass',
  accountOrders: '/account#orders',
  accountSaved: '/account#saved',

  business: '/business',
  businessRegister: '/business/register',

  merchant: '/store-manager',
  merchantClaims: '/store-manager/claims',
  merchantDeals: '/store-manager/deals',
  merchantDealNew: '/store-manager/deals/new',
  merchantDealEdit: (id: string) => `/store-manager/deals/${id}`,
  merchantOrders: '/store-manager/orders',
  merchantLedger: '/store-manager/ledger',
  merchantSettings: '/store-manager/settings',

  adminVerifications: '/admin/verifications',
  adminMerchants: '/admin/merchants',
  adminSettlements: '/admin/settlements',

  about: '/about',
  help: '/help',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
} as const;
