import { ROUTES } from '@/lib/routes';
import type { Viewer } from './types';

/** Where someone lands after signing in. Merchants never reach the platform admin. */
export function homeFor(viewer: Viewer): string {
  if (viewer.kind === 'admin') return ROUTES.adminVerifications;
  if (viewer.kind === 'merchant') {
    return viewer.role === 'cashier' ? ROUTES.merchantClaims : ROUTES.merchant;
  }
  return ROUTES.account;
}
