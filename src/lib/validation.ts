import { z } from 'zod';

/** The ten digits after +92, as PhoneField gives them. */
export const mobileSchema = (message = 'Enter a 10-digit mobile number, like 300 1234567.') =>
  z.string().regex(/^3\d{9}$/, message);

export const emailSchema = (message = 'Enter a full email address, like name@example.com.') =>
  z.string().trim().toLowerCase().pipe(z.email(message));

export function formatPhone(digits: string): string {
  return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
}
