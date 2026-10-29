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
 * Calendar-day distance (UTC) from `reference`, e.g. "Today", "3 days ago", "in 2 days".
 * Pass an explicit reference so rendering stays deterministic.
 */
export function formatRelativeDays(
  value: IsoDateString | Date,
  reference: IsoDateString | Date,
): string {
  const date = toDate(value);
  const ref = toDate(reference);
  if (!date || !ref) return "—";
  const utcDay = (value: Date) =>
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  const days = Math.round((utcDay(date) - utcDay(ref)) / DAY_MS);
  if (days === 0) return "Today";
  if (days === -1) return "Yesterday";
  if (days === 1) return "Tomorrow";
  return days < 0 ? `${Math.abs(days)} days ago` : `in ${days} days`;
}

/** Rough distance from now, e.g. "in 3 h", "45 min ago". Client-only (uses the real clock). */
export function formatFromNow(value: IsoDateString | null | undefined, now = Date.now()): string {
  const date = value ? toDate(value) : null;
  if (!date) return "—";
  const minutes = Math.round((date.getTime() - now) / 60_000);
  const abs = Math.abs(minutes);
  const text =
    abs < 60
      ? `${abs} min`
      : abs < 48 * 60
        ? `${Math.round(abs / 60)} h`
        : `${Math.round(abs / 1440)} days`;
  return minutes >= 0 ? `in ${text}` : `${text} ago`;
}
