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
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
  
  return {
    start: `${y}-${m}-01`,
    end: `${y}-${m}-${String(lastDay).padStart(2, '0')}T23:59:59.999Z`,
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

export const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export type FilterPeriod = 'current' | 'last' | 'all' | { from: string; to: string };

export function getSubscriptionOptionsFromPeriod(
  period: FilterPeriod
): { startDate: string; endDate: string } | undefined {
  if (period === 'all') return undefined;
  if (period === 'current') {
    const { start, end } = getMonthRange();
    return { startDate: start, endDate: end };
  }
  if (period === 'last') {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1);
    const { start, end } = getMonthRange(prev.getFullYear(), prev.getMonth());
    return { startDate: start, endDate: end };
  }
  return { 
    startDate: period.from, 
    endDate: `${period.to}T23:59:59.999Z` 
  };
}
