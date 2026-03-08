import { DateTime } from 'luxon';

export type MonthRange = { start: string; end: string };

/** Normaliza cualquier fecha a ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ) para almacenamiento. */
export function toStorageISO(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const s = String(value ?? '').trim();
  if (!s) return '';
  if (s.includes('T')) return new Date(s).toISOString();
  return `${s}T00:00:00.000Z`;
}

/** Extrae YYYY-MM-DD y devuelve inicio del día en ISO (00:00:00.000Z). */
export function toISOStartOfDay(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }
  const s = String(value ?? '').trim();
  if (!s) return '';
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z`;
  return new Date(s).toISOString();
}

/** Extrae YYYY-MM-DD y devuelve fin del día en ISO (23:59:59.999Z). */
export function toISOEndOfDay(value: string | Date): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T23:59:59.999Z`;
  }
  const s = String(value ?? '').trim();
  if (!s) return '';
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}T23:59:59.999Z`;
  const d = new Date(s);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T23:59:59.999Z`;
}

/**
 * Returns ISO date range for a given month (default: current month).
 * start/end siempre en formato ISO completo para Firestore.
 */
export function getMonthRange(year?: number, month?: number): MonthRange {
  const d = year != null && month != null
    ? new Date(year, month, 1)
    : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, d.getMonth() + 1, 0).getDate();
  return {
    start: `${y}-${m}-01T00:00:00.000Z`,
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
    startDate: toISOStartOfDay(period.from),
    endDate: toISOEndOfDay(period.to),
  };
}
