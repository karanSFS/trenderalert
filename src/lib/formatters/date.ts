import type { IsoDateString } from "@/types/common";

/**
 * Fixed locale and time zone keep server and client output identical (no hydration mismatch)
 * and match the specification's rule that server UTC time is authoritative.
 */
const LOCALE = "en-US";
const TIME_ZONE = "UTC";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value: IsoDateString | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "Oct 28, 2026". Returns an em dash for missing or invalid input. */
export function formatDate(value: IsoDateString | Date | null | undefined): string {
  const date = value ? toDate(value) : null;
  return date ? dateFormatter.format(date) : "—";
}

/** e.g. "Oct 28, 2026, 14:05 UTC". */
export function formatDateTime(value: IsoDateString | Date | null | undefined): string {
  const date = value ? toDate(value) : null;
  return date ? `${dateTimeFormatter.format(date)} UTC` : "—";
}

/**
 * Whole-day distance from `reference`, e.g. "Today", "3 days ago", "in 2 days".
 * Pass an explicit reference so rendering stays deterministic.
 */
export function formatRelativeDays(
  value: IsoDateString | Date,
  reference: IsoDateString | Date,
): string {
  const date = toDate(value);
  const ref = toDate(reference);
  if (!date || !ref) return "—";
  const days = Math.round((date.getTime() - ref.getTime()) / DAY_MS);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  if (days === 1) return "Tomorrow";
  return days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`;
}
