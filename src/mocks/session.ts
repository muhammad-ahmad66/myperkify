import type { Viewer } from '@/features/session/types';
import { API_ERROR_CODES } from '@/lib/api/types';
import { blankUser, getDb, type MockRole, type MockUser } from './db';
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

/**
 * Hosts such as Vercel run several server instances that do not share memory, so the mock data
 * can differ between requests. The cookie carries a small copy of the account, and an instance
 * that has never seen this person rebuilds them from it. Mock only: the real backend keeps
 * accounts in a database and signs its sessions.
 */
const SNAPSHOT_FIELDS = [
  'role',
  'name',
  'email',
  'universityId',
  'status',
  'method',
  'methodLabel',
  'rejectionReason',
  'submittedAt',
  'merchantId',
  'branchId',
] as const satisfies readonly (keyof MockUser)[];

type Snapshot = Pick<MockUser, (typeof SNAPSHOT_FIELDS)[number]>;

function encodeSnapshot(user: MockUser): string {
  const snapshot = Object.fromEntries(SNAPSHOT_FIELDS.map((field) => [field, user[field]]));
  return Buffer.from(JSON.stringify(snapshot), 'utf8').toString('base64url');
}

function decodeSnapshot(value: string): Snapshot | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    return parsed && typeof parsed === 'object' ? (parsed as Snapshot) : null;
  } catch {
    return null;
  }
}

function readSession(request: Request): { id: string; snapshot: Snapshot | null } | null {
  const value = readCookie(request, SESSION_COOKIE);
  if (!value) return null;
  const [id = '', encoded] = value.split('.');
  return id ? { id, snapshot: encoded ? decodeSnapshot(encoded) : null } : null;
}

export function currentUser(request: Request): MockUser | null {
  const session = readSession(request);
  if (!session) return null;
  const db = getDb();
  const known = db.users.get(session.id);
  if (known) return known;
  if (!session.snapshot) return null;
  const rebuilt: MockUser = { ...blankUser(session.id), ...session.snapshot };
  db.users.set(rebuilt.id, rebuilt);
  return rebuilt;
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

export function withSession(response: Response, user: MockUser | null): Response {
  const cookie =
    user === null
      ? `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
      : `${SESSION_COOKIE}=${user.id}.${encodeSnapshot(user)}; Path=/; HttpOnly; SameSite=Lax`;
  response.headers.append('set-cookie', cookie);
  return response;
}

/** Keeps the cookie's copy current after any change, such as a student becoming verified. */
export function refreshSession(request: Request, response: Response): Response {
  if (response.headers.has('set-cookie')) return response;
  const session = readSession(request);
  const user = session ? getDb().users.get(session.id) : undefined;
  return user ? withSession(response, user) : response;
}
