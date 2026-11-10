import type { University } from '../types';

const PERSONAL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'live.com',
];

export type EmailKind = 'none' | 'university' | 'personal' | 'other';

export function emailDomain(email: string): string {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf('@');
  return at > 0 ? value.slice(at + 1) : '';
}

/** Client hint only. The server repeats this check before sending a code. */
export function classifyEmail(email: string): EmailKind {
  const domain = emailDomain(email);
  if (!domain || !domain.includes('.')) return 'none';
  if (/\.edu(\.pk)?$/.test(domain)) return 'university';
  if (PERSONAL_DOMAINS.includes(domain)) return 'personal';
  return 'other';
}

export function findUniversityByEmail(
  email: string,
  universities: University[],
): University | undefined {
  const domain = emailDomain(email);
  if (!domain) return undefined;
  return universities.find((university) =>
    university.emailDomains.some((known) => domain === known || domain.endsWith(`.${known}`)),
  );
}
