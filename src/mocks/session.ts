import type { Viewer } from '@/features/session/types';
import { API_ERROR_CODES } from '@/lib/api/types';
import { getDb, type MockRole, type MockUser } from './db';
import { HttpError } from './http';
import { UNIVERSITIES } from './seed/universities';

export const SESSION_COOKIE = 'mp_mock_session';

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

export function currentUser(request: Request): MockUser | null {
  const id = readCookie(request, SESSION_COOKIE);
  return id ? (getDb().users.get(id) ?? null) : null;
}

export function requireUser(request: Request): MockUser {
  const user = currentUser(request);
  if (!user) {
    throw new HttpError(401, API_ERROR_CODES.unauthenticated, 'Sign in to continue.');
  }
  return user;
}

export function requireVerified(request: Request): MockUser {
  const user = requireUser(request);
  if (user.role !== 'student' || user.status !== 'verified') {
    throw new HttpError(403, API_ERROR_CODES.notVerified, 'Verify as a student to use this deal.');
  }
  return user;
}

/** Every staff endpoint starts here. Hiding a page is never the protection. */
export function requireRole(request: Request, ...roles: MockRole[]): MockUser {
  const user = requireUser(request);
  if (!roles.includes(user.role)) {
    throw new HttpError(403, API_ERROR_CODES.forbidden, "You don't have access to that.");
  }
  return user;
}

export function universityName(user: MockUser): string {
  const university = UNIVERSITIES.find((entry) => entry.id === user.universityId);
  return university && university.emailDomains.length > 0 ? university.name : 'Verified student';
}

export function canSeeStudentPrices(user: MockUser | null): boolean {
  return user?.role === 'student' && user.status === 'verified';
}

export function toViewer(user: MockUser | null): Viewer {
  if (!user) return { kind: 'visitor' };

  if (user.role === 'admin') {
    return { kind: 'admin', id: user.id, name: user.name, email: user.email };
  }

  if (user.role !== 'student') {
    const merchant = getDb().merchants.get(user.merchantId ?? '');
    return {
      kind: 'merchant',
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      merchant: {
        id: merchant?.id ?? '',
        name: merchant?.name ?? '',
        status: merchant?.status ?? 'applied',
        rejectionReason: merchant?.rejectionReason ?? null,
      },
    };
  }

  const university = UNIVERSITIES.find((entry) => entry.id === user.universityId);
  return {
    kind: 'student',
    id: user.id,
    name: user.name,
    email: user.email,
    university: university && university.emailDomains.length > 0 ? university.name : null,
    verification: {
      status: user.status,
      method: user.method,
      methodLabel: user.methodLabel,
      rejectionReason: user.rejectionReason,
      submittedAt: user.submittedAt,
    },
  };
}

export function withSession(response: Response, userId: string | null): Response {
  const cookie =
    userId === null
      ? `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      : `${SESSION_COOKIE}=${userId}; Path=/; HttpOnly; SameSite=Lax`;
  response.headers.append('set-cookie', cookie);
  return response;
}
