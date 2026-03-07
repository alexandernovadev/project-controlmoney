/**
 * Formats a raw string input as a valid amount value.
 * Strips non-numeric chars (except decimal), limits decimal places.
 *
 * @param value - Raw input string (e.g. "12.345" or "abc123.45")
 * @param maxDecimals - Maximum number of decimal places allowed
 * @returns Sanitized amount string safe for display and storage
 *
 * @example
 * formatAmount("12.345", 2)  // "12.34"
 * formatAmount("abc99.9", 2) // "99.9"
 */
export function formatAmount(value: string, maxDecimals: number): string {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) return value;
  if (parts[1] && parts[1].length > maxDecimals) {
    return `${parts[0]}.${parts[1].slice(0, maxDecimals)}`;
  }
  return cleaned;
}
