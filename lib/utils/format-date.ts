import { DateTime } from 'luxon';

export type MonthRange = { start: string; end: string };

/**
 * Returns ISO date range for a given month (default: current month).
 * Used for Firestore date filters.
 */
export function getMonthRange(year?: number, month?: number): MonthRange {
  const d = year != null && month != null
    ? new Date(year, month, 1)
    : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Format date for display (e.g. "Monday 5 Feb 2026 at 5:21:45PM")
 */
export function formatDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const dt = DateTime.fromISO(isoDate).setLocale('en-US');
  return dt.isValid ? dt.toFormat("EEEE d MMM yyyy 'at' h:mm:ssa") : isoDate;
}

/**
 * Returns today's date in local time as "YYYY-MM-DD"
 */
export function todayLocalISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
