import { z } from 'zod';
import { accountSchema, verificationCodeSchema } from '@/features/verification/schemas';
import { classifyEmail, emailDomain } from '@/features/verification/lib/emailDomain';
import { API_ERROR_CODES } from '@/lib/api/types';
import { CARD_MAX_BYTES } from '@/lib/constants';
import { blankUser, getDb, nextId, type MockUser } from '../db';
import { HttpError, invalid, ok, readJson } from '../http';
import { UNIVERSITIES } from '../seed/universities';
import { currentUser, requireUser, toViewer, withSession } from '../session';

export function listUniversities(): Response {
  return ok(UNIVERSITIES);
}

function issueCode(user: MockUser): void {
  user.verificationCode = String(100000 + Math.floor(Math.random() * 900000));
  getDb().lastCode = user.verificationCode;
  // Stands in for the email. The Dev panel shows it too.
  console.info(`[mock] verification code for ${user.email}: ${user.verificationCode}`);
}

export async function createAccount(request: Request): Promise<Response> {
  const parsed = accountSchema.safeParse(await readJson(request, z.unknown()));
  if (!parsed.success) {
    const fields = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    );
    throw invalid('Check the highlighted fields.', fields);
  }
  const values = parsed.data;

  const current = currentUser(request);
  const owner = [...getDb().users.values()].find((user) => user.email === values.email);
  if (owner && owner.id !== current?.id) {
    const message = 'That email already has an account. Sign in instead.';
    throw new HttpError(409, API_ERROR_CODES.emailTaken, message, { email: message });
  }

  const user: MockUser = current ?? blankUser(nextId('user'));
  Object.assign(user, {
    name: values.name,
    email: values.email,
    universityId: values.universityId,
    method: values.method,
  });
  getDb().users.set(user.id, user);

  if (values.method === 'email') issueCode(user);
  return withSession(ok(toViewer(user), 201), user.id);
}

export async function checkCode(request: Request): Promise<Response> {
  const user = requireUser(request);
  const { code } = await readJson(request, verificationCodeSchema);
  if (!user.verificationCode || code !== user.verificationCode) {
    throw new HttpError(
      422,
      API_ERROR_CODES.codeMismatch,
      "That code doesn't match. Check the latest email from MyPerkify and try again.",
    );
  }
  user.verificationCode = null;
  user.status = 'verified';
  user.method = 'email';
  user.methodLabel = `via ${emailDomain(user.email)}`;
  return ok(toViewer(user));
}

export function resendCode(request: Request): Response {
  const user = requireUser(request);
  if (classifyEmail(user.email) === 'university') issueCode(user);
  return ok({ sent: true });
}

function isJpegOrPng(bytes: Uint8Array): boolean {
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return isJpeg || isPng;
}

/** Checks the actual bytes, then throws the file away. The mock never stores a student card. */
export async function uploadCard(request: Request): Promise<Response> {
  const user = requireUser(request);
  const form = await request.formData();
  const file = form.get('card');
  if (!(file instanceof File)) throw invalid('Choose a photo of your card.');

  const message = (await isValidCard(file)) ? null : 'Use a JPG or PNG photo of your card.';
  if (message) throw invalid(message);
  if (file.size > CARD_MAX_BYTES) throw invalid('That photo is over 5 MB. Try a smaller one.');

  user.status = 'pending';
  user.method = 'card';
  user.rejectionReason = null;
  user.submittedAt = new Date().toISOString();
  return ok(toViewer(user));
}

async function isValidCard(file: File): Promise<boolean> {
  return isJpegOrPng(new Uint8Array(await file.slice(0, 4).arrayBuffer()));
}
