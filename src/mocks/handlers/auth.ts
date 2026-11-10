import { z } from 'zod';
import { API_ERROR_CODES } from '@/lib/api/types';
import { getDb } from '../db';
import { HttpError, ok, readJson } from '../http';
import { toViewer, withSession } from '../session';

const WRONG_CODE = "That code doesn't match. Check the latest email from MyPerkify and try again.";

function findByEmail(email: string) {
  return [...getDb().users.values()].find((user) => user.email === email);
}

/** Email and a 6-digit code, the prototype's assumption. The real method is D-03. */
export async function requestSignIn(request: Request): Promise<Response> {
  const { email } = await readJson(request, z.object({ email: z.string() }));
  const user = findByEmail(email.trim().toLowerCase());
  if (!user) {
    const message = "We couldn't find an account with that email.";
    throw new HttpError(404, API_ERROR_CODES.notFound, message, { email: message });
  }
  user.verificationCode = String(100000 + Math.floor(Math.random() * 900000));
  getDb().lastCode = user.verificationCode;
  console.info(`[mock] sign-in code for ${user.email}: ${user.verificationCode}`);
  return ok({ sent: true });
}

export async function confirmSignIn(request: Request): Promise<Response> {
  const body = await readJson(request, z.object({ email: z.string(), code: z.string() }));
  const user = findByEmail(body.email.trim().toLowerCase());
  if (!user?.verificationCode || user.verificationCode !== body.code) {
    throw new HttpError(422, API_ERROR_CODES.codeMismatch, WRONG_CODE);
  }
  user.verificationCode = null;
  return withSession(ok(toViewer(user)), user.id);
}

export function signOut(): Response {
  return withSession(ok({ signedOut: true }), null);
}
