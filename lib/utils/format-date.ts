/**
 * Format date for display (e.g. "7 Mar", "28 Feb")
 */
export function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  return `${day} ${month}`;
}
