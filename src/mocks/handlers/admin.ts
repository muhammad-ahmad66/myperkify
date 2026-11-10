import { z } from 'zod';
import { applicationDataSchema } from '@/features/business/schemas';
import { API_ERROR_CODES } from '@/lib/api/types';
import { CARD_MAX_BYTES } from '@/lib/constants';
import { blankUser, getDb, nextId } from '../db';
import { HttpError, invalid, ok, readJson } from '../http';
import { applySettlement, balanceOf } from '../ledger';
import { requireRole, universityName } from '../session';

const AUDIT_NOTE = '[mock audit]';

function audit(actor: string, action: string): void {
  // The real backend writes this to AuditLog with actor and time.
  console.info(AUDIT_NOTE, actor, action);
}

export function getCounts(request: Request): Response {
  requireRole(request, 'admin');
  const db = getDb();
  return ok({
    verifications: [...db.users.values()].filter((user) => user.status === 'pending').length,
    merchants: [...db.merchants.values()].filter((merchant) => merchant.status === 'applied')
      .length,
    settlements: [...db.settlements.values()].filter((item) => item.status === 'submitted').length,
  });
}

export function listVerifications(request: Request): Response {
  requireRole(request, 'admin');
  const pending = [...getDb().users.values()]
    .filter((user) => user.role === 'student' && user.status === 'pending')
    .sort((a, b) => (a.submittedAt ?? '').localeCompare(b.submittedAt ?? ''))
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      university: universityName(user),
      submittedAt: user.submittedAt,
    }));
  return ok(pending);
}

const decisionBody = z
  .object({ decision: z.enum(['approve', 'reject']), reason: z.string().trim().optional() })
  .refine((body) => body.decision === 'approve' || (body.reason?.length ?? 0) >= 5, {
    path: ['reason'],
  });

export async function decideVerification(request: Request, id: string): Promise<Response> {
  const admin = requireRole(request, 'admin');
  const { decision, reason } = await readJson(request, decisionBody);
  const user = getDb().users.get(id);
  if (!user || user.status !== 'pending') {
    throw new HttpError(409, API_ERROR_CODES.validation, 'Someone has already reviewed this card.');
  }
  if (decision === 'approve') {
    user.status = 'verified';
    user.methodLabel = 'via student card';
  } else {
    user.status = 'rejected';
    user.rejectionReason = reason ?? null;
  }
  audit(admin.name, `${decision} card ${user.id}`);
  return ok({ id, status: user.status });
}

export function listMerchants(request: Request): Response {
  requireRole(request, 'admin');
  const merchants = [...getDb().merchants.values()]
    .sort((a, b) => Number(b.status === 'applied') - Number(a.status === 'applied'))
    .map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      initials: merchant.initials,
      color: merchant.color,
      description: merchant.description,
      ownerName: merchant.ownerName,
      ownerEmail: merchant.ownerEmail,
      phone: merchant.phone,
      branchesNote: merchant.branchesNote,
      status: merchant.status,
      balance: balanceOf(merchant.id),
    }));
  return ok(merchants);
}

export async function decideMerchant(request: Request, id: string): Promise<Response> {
  const admin = requireRole(request, 'admin');
  const { decision, reason } = await readJson(request, decisionBody);
  const merchant = getDb().merchants.get(id);
  if (!merchant || merchant.status !== 'applied') {
    throw new HttpError(409, API_ERROR_CODES.validation, 'This application was already decided.');
  }
  merchant.status = decision === 'approve' ? 'active' : 'rejected';
  merchant.rejectionReason = decision === 'reject' ? (reason ?? null) : null;
  audit(admin.name, `${decision} merchant ${id}`);
  return ok({ id, status: merchant.status });
}

export function listSettlements(request: Request): Response {
  requireRole(request, 'admin');
  const db = getDb();
  const settlements = [...db.settlements.values()]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((settlement) => ({
      id: settlement.id,
      merchantName: db.merchants.get(settlement.merchantId)?.name ?? '',
      amount: settlement.amount,
      reference: settlement.reference,
      status: settlement.status,
      createdAt: new Date(settlement.createdAt).toISOString(),
    }));
  const balances = [...db.merchants.values()]
    .filter((merchant) => balanceOf(merchant.id) > 0)
    .map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      balance: balanceOf(merchant.id),
      status: merchant.status,
    }))
    .sort((a, b) => b.balance - a.balance);
  return ok({ settlements, balances, threshold: db.settings.threshold });
}

export async function decideSettlement(request: Request, id: string): Promise<Response> {
  const admin = requireRole(request, 'admin');
  const { decision } = await readJson(
    request,
    z.object({ decision: z.enum(['confirm', 'reject']) }),
  );
  const settlement = getDb().settlements.get(id);
  if (!settlement || settlement.status !== 'submitted') {
    throw new HttpError(409, API_ERROR_CODES.validation, 'This settlement was already decided.');
  }
  settlement.status = decision === 'confirm' ? 'confirmed' : 'rejected';
  if (decision === 'confirm') {
    settlement.confirmedAt = Date.now();
    applySettlement(settlement.merchantId, settlement.amount);
  }
  audit(admin.name, `${decision} settlement ${id}`);
  return ok({ id, status: settlement.status });
}

function isDocument(bytes: Uint8Array): boolean {
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return isPdf || isJpeg || isPng;
}

async function checkProof(form: FormData): Promise<void> {
  const proof = form.get('proof');
  if (!(proof instanceof File)) throw invalid('Upload your document to continue.');
  if (proof.size > CARD_MAX_BYTES) throw invalid('That file is over 5 MB. Try a smaller one.');
  if (!isDocument(new Uint8Array(await proof.slice(0, 4).arrayBuffer()))) {
    throw invalid('Upload a PDF, JPG or PNG.');
  }
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/** Public. Creates the owner account and an applied store for admins to review. */
export async function submitApplication(request: Request): Promise<Response> {
  const form = await request.formData();
  const parsed = applicationDataSchema.safeParse(
    JSON.parse(String(form.get('application') ?? 'null')),
  );
  if (!parsed.success) {
    const fields = Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.'), issue.message]),
    );
    throw invalid('Check your application and try again.', fields);
  }
  await checkProof(form);

  const values = parsed.data;
  const db = getDb();
  if ([...db.users.values()].some((user) => user.email === values.email)) {
    const message = 'That email already has an account. Sign in instead.';
    throw new HttpError(409, API_ERROR_CODES.emailTaken, message, { email: message });
  }

  const id = nextId('merchant');
  db.merchants.set(id, {
    id,
    slug: id,
    name: values.tradingName,
    initials: initialsOf(values.tradingName),
    color: '#A020F0',
    categoryId: values.categoryId,
    description: '',
    status: 'applied',
    ownerName: values.ownerName,
    ownerEmail: values.email,
    phone: values.phone,
    // Hours come later, from Store settings.
    branches: values.branches.map((branch) => ({
      ...branch,
      id: nextId('branch'),
      opensAt: '',
      closesAt: '',
      distance: '',
      statusLabel: 'Hours not set',
      isOpen: true,
    })),
    branchesNote:
      values.redemption === 'online'
        ? 'Online only'
        : `${values.branches.length} branch${values.branches.length === 1 ? '' : 'es'}: ${values.branches
            .map((branch) => branch.name)
            .join(', ')}`,
    rejectionReason: null,
    createdAt: Date.now(),
  });
  const ownerId = nextId('user');
  db.users.set(ownerId, {
    ...blankUser(ownerId),
    role: 'merchant_owner',
    status: 'verified',
    name: values.ownerName,
    email: values.email,
    merchantId: id,
  });
  return ok({ reference: `APP-${10000 + db.sequence}` }, 201);
}

export async function submitContact(request: Request): Promise<Response> {
  await readJson(
    request,
    z.object({ name: z.string().min(2), email: z.string(), message: z.string().min(10) }),
  );
  return ok({ received: true }, 201);
}
