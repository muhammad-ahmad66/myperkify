import { refreshSession } from '../session';
import { getResponse, http } from 'msw';
import type { HttpHandler } from 'msw';
import { DEV_TOOLS_ENABLED, MOCK_API_PATH, USES_MOCK_API } from '@/lib/api/config';
import { API_ERROR_CODES } from '@/lib/api/types';
import { failure, HttpError, notFound } from '../http';
import { deleteAccount, getAccountSummary, listSaved, updateProfile } from './account';
import {
  decideMerchant,
  decideSettlement,
  decideVerification,
  getCounts,
  listMerchants,
  listSettlements,
  listVerifications,
  submitApplication,
  submitContact,
} from './admin';
import { confirmSignIn, requestSignIn, signOut } from './auth';
import { addCartItem, getCart, removeCartItem, updateCartItem } from './cart';
import { createBranch, deleteBranch, updateBranch } from './branches';
import { addCashier, removeCashier, updateCashier } from './staff';
import { cancelClaim, createClaim, getClaim, getClaimPass, getLiveClaim } from './claims';
import { createReport, getDeal, listCategories, listDeals, searchDeals, setSaved } from './deals';
import { decideCard, devApproveClaim, getDevState, reset, setNetwork, setViewer } from './dev';
import {
  approveClaim,
  scanClaim,
  getLedger,
  getOverview,
  getStoreSettings,
  listClaims,
  listMerchantOrders,
  submitSettlement,
  updateOrderStatus,
  updateStoreSettings,
} from './merchant';
import { createOwnDeal, getOwnDeal, listOwnDeals, updateOwnDeal } from './merchantDeals';
import { getOrder, getReceipt, listOrders, placeOrder } from './orders';
import { getSession } from './session';
import { getStore } from './stores';
import { checkCode, createAccount, listUniversities, resendCode, uploadCard } from './verification';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Resolver = (request: Request, id: string) => Response | Promise<Response>;

/** Faults a handler raises become the API's standard error response. */
async function respond(resolver: Resolver, request: Request, id: string): Promise<Response> {
  try {
    return await resolver(request, id);
  } catch (error) {
    if (error instanceof HttpError) return failure(error);
    console.error('[mock] unexpected error', error);
    return failure(
      new HttpError(500, API_ERROR_CODES.unknown, 'Something went wrong on our side.'),
    );
  }
}

function route(method: Method, path: string, resolver: Resolver): HttpHandler {
  return http[method](`*${MOCK_API_PATH}${path}`, ({ request, params }) =>
    respond(resolver, request, String(params.id ?? '')),
  );
}

function devRoute(method: Method, path: string, resolver: Resolver): HttpHandler {
  return route(method, `/dev${path}`, (request, id) => {
    if (!DEV_TOOLS_ENABLED) throw notFound();
    return resolver(request, id);
  });
}

/** Order matters. Fixed paths come before the :id paths that would also match them. */
export const handlers: HttpHandler[] = [
  route('get', '/session', getSession),
  route('post', '/auth/sign-in', requestSignIn),
  route('post', '/auth/confirm', confirmSignIn),
  route('post', '/auth/sign-out', signOut),

  route('get', '/categories', listCategories),
  route('get', '/deals', listDeals),
  route('get', '/deals/search', searchDeals),
  route('get', '/deals/:id', getDeal),
  route('get', '/stores/:id', getStore),
  route('put', '/saved-deals/:id', setSaved),
  route('post', '/reports', createReport),

  route('get', '/universities', listUniversities),
  route('post', '/verification/account', createAccount),
  route('post', '/verification/code', checkCode),
  route('post', '/verification/code/resend', resendCode),
  route('post', '/verification/card', uploadCard),

  route('post', '/claims', createClaim),
  route('get', '/claims/live', getLiveClaim),
  route('get', '/claims/:id', getClaim),
  route('get', '/claims/:id/pass', getClaimPass),
  route('delete', '/claims/:id', cancelClaim),

  route('get', '/cart', getCart),
  route('post', '/cart/items', addCartItem),
  route('patch', '/cart/items/:id', updateCartItem),
  route('delete', '/cart/items/:id', removeCartItem),

  route('get', '/orders', listOrders),
  route('post', '/orders', placeOrder),
  route('get', '/orders/:id', getOrder),
  route('get', '/orders/:id/receipt', getReceipt),

  route('get', '/account/summary', getAccountSummary),
  route('get', '/account/saved', listSaved),
  route('patch', '/account/profile', updateProfile),
  route('delete', '/account', deleteAccount),

  route('post', '/business/applications', submitApplication),
  route('post', '/contact', submitContact),

  route('get', '/merchant/overview', getOverview),
  route('get', '/merchant/claims', listClaims),
  route('post', '/merchant/claims/scan', scanClaim),
  route('post', '/merchant/claims/:id/approve', approveClaim),
  route('get', '/merchant/orders', listMerchantOrders),
  route('post', '/merchant/orders/:id/status', updateOrderStatus),
  route('get', '/merchant/ledger', getLedger),
  route('post', '/merchant/settlements', submitSettlement),
  route('get', '/merchant/deals', listOwnDeals),
  route('post', '/merchant/deals', createOwnDeal),
  route('get', '/merchant/deals/:id', getOwnDeal),
  route('put', '/merchant/deals/:id', updateOwnDeal),
  route('get', '/merchant/settings', getStoreSettings),
  route('put', '/merchant/settings', updateStoreSettings),
  route('post', '/merchant/branches', createBranch),
  route('put', '/merchant/branches/:id', updateBranch),
  route('delete', '/merchant/branches/:id', deleteBranch),
  route('post', '/merchant/staff', addCashier),
  route('put', '/merchant/staff/:id', updateCashier),
  route('delete', '/merchant/staff/:id', removeCashier),

  route('get', '/admin/counts', getCounts),
  route('get', '/admin/verifications', listVerifications),
  route('post', '/admin/verifications/:id', decideVerification),
  route('get', '/admin/merchants', listMerchants),
  route('post', '/admin/merchants/:id', decideMerchant),
  route('get', '/admin/settlements', listSettlements),
  route('post', '/admin/settlements/:id', decideSettlement),

  devRoute('get', '/state', getDevState),
  devRoute('post', '/viewer', setViewer),
  devRoute('post', '/network', setNetwork),
  devRoute('post', '/card-decision', decideCard),
  devRoute('post', '/claims/:id/approve', (_request, id) => devApproveClaim(id)),
  devRoute('post', '/reset', reset),
];

/**
 * MSW normally runs in a browser service worker, which would put every student price in the
 * client bundle. getResponse runs the same handlers on the server instead, so the browser makes
 * a real request and receives only what the viewer is allowed to see.
 */
export async function handleMockRequest(request: Request): Promise<Response> {
  if (!USES_MOCK_API) return failure(notFound());
  const response = (await getResponse(handlers, request)) ?? failure(notFound());
  return refreshSession(request, response);
}
