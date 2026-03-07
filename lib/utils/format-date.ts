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
 * Format date for display (e.g. "7 Mar", "28 Feb")
 */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  return `${day} ${month}`;
}
