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

/**
 * Formats raw amount for display with thousand separators (dot).
 * Raw value is stored; this is for visual display only.
 *
 * @example
 * formatAmountForDisplay("197000")   // "197.000"
 * formatAmountForDisplay("1290000")  // "1.290.000"
 * formatAmountForDisplay("197000.5") // "197.000,5"
 */
export function formatAmountForDisplay(raw: string): string {
  if (!raw || raw === '.') return raw;
  const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
  const parts = cleaned.split('.');
  const intPart = parts[0]?.replace(/\D/g, '') ?? '';
  const decPart = parts[1] ?? '';
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart ? `${formatted},${decPart}` : formatted;
}

/**
 * Formats a number for display (e.g. in lists, totals).
 * Uses en-US locale with 0-2 decimal places.
 */
export function formatAmountNumber(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parses display string (with thousand separators) back to raw numeric string.
 * Handles: "197.000", "1.290.000,5", "197.000.5"
 */
export function parseAmountFromDisplay(display: string, maxDecimals: number): string {
  const cleaned = display.replace(/[^0-9.,]/g, '');
  if (!cleaned) return '';
  if (cleaned.includes(',')) {
    const [intPart, decPart] = cleaned.split(',');
    const rawInt = (intPart ?? '').replace(/\./g, '');
    const rawDec = (decPart ?? '').slice(0, maxDecimals);
    return rawDec ? `${rawInt}.${rawDec}` : rawInt;
  }
  const parts = cleaned.split('.');
  const last = parts[parts.length - 1] ?? '';
  const isDecimal = last.length <= maxDecimals && /^\d+$/.test(last);
  if (isDecimal && parts.length > 1) {
    const intPart = parts.slice(0, -1).join('');
    return `${intPart}.${last}`;
  }
  return cleaned.replace(/\./g, '');
}
