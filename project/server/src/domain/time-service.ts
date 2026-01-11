import { DateTime } from 'luxon';

export const PARIS_TIMEZONE = 'Europe/Paris' as const;

/**
 * Converts a UTC instant (ISO 8601 string with offset or Z) to a Paris day key (YYYY-MM-DD).
 *
 * This function is explicit about the timezone and does not depend on the host/system TZ.
 */
export function dayKeyParisFromUtcIso(utcIso: string): string {
  const utc = DateTime.fromISO(utcIso, { zone: 'utc' });
  if (!utc.isValid) {
    throw new Error(`Invalid UTC ISO date: ${utcIso}`);
  }

  return utc.setZone(PARIS_TIMEZONE).toFormat('yyyy-LL-dd');
}

/**
 * Converts a Date (instant) to a Paris day key (YYYY-MM-DD).
 *
 * Note: a JS Date represents an absolute instant; we interpret it as UTC then convert.
 */
export function dayKeyParisFromDate(date: Date): string {
  const utc = DateTime.fromJSDate(date, { zone: 'utc' });
  if (!utc.isValid) {
    throw new Error('Invalid Date');
  }

  return utc.setZone(PARIS_TIMEZONE).toFormat('yyyy-LL-dd');
}
