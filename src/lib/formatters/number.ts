const LOCALE = "en-US";

const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const percentFormatter = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 1,
});

const currencyFormatters = new Map<string, Intl.NumberFormat>();

/** e.g. 12840 -> "12,840". */
export function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? integerFormatter.format(value) : "—";
}

/** e.g. 12840 -> "12.8K". */
export function formatCompact(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? compactFormatter.format(value) : "—";
}

/** Takes a ratio: 0.124 -> "12.4%". */
export function formatPercent(ratio: number | null | undefined): string {
  return typeof ratio === "number" && Number.isFinite(ratio) ? percentFormatter.format(ratio) : "—";
}

/** Takes minor units (cents) to avoid floating-point money: 129900 -> "$1,299.00". */
export function formatCurrency(minorUnits: number | null | undefined, currency = "USD"): string {
  if (typeof minorUnits !== "number" || !Number.isFinite(minorUnits)) return "—";
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(minorUnits / 100);
}

/** Compact US dollars from minor units: 4823000 -> "$48.2K". */
export function formatCompactCurrency(minorUnits: number | null | undefined): string {
  if (typeof minorUnits !== "number" || !Number.isFinite(minorUnits)) return "—";
  return `$${compactFormatter.format(minorUnits / 100)}`;
}

/** Signed change label used with an arrow icon, e.g. 0.052 -> "+5.2%". */
export function formatSignedPercent(ratio: number): string {
  const formatted = formatPercent(Math.abs(ratio));
  if (ratio > 0) return `+${formatted}`;
  if (ratio < 0) return `-${formatted}`;
  return formatted;
}
