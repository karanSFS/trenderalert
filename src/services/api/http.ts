import { MockServiceError } from "@/services/mock/mockDelay";
import type { PaginatedResult, ServiceError } from "@/types/api";

/** Error thrown by backend-connected services. Same shape as the mock errors. */
export class ApiServiceError extends MockServiceError {}

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Fired when the backend session has ended; the admin shell signs out and redirects. */
export const SESSION_ENDED_EVENT = "ta:session-ended";

function announceSessionEnded() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}

/**
 * Calls the TrenderAlert backend through the app's authenticated proxy (`/api/backend/*`).
 * Tokens never reach the browser. An ended session announces `SESSION_ENDED_EVENT`.
 */
export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, QueryValue>;
    body?: unknown;
  } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}${buildQuery(options.query)}`, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiServiceError("UNAVAILABLE", "Could not reach the server. Check your connection.");
  }

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const error = (payload as { error?: ServiceError } | null)?.error;
    if (response.status === 401) announceSessionEnded();
    throw new ApiServiceError(
      error?.code ?? (response.status === 401 ? "UNAUTHENTICATED" : "UNKNOWN"),
      error?.message ?? `The request failed (status ${response.status}).`,
    );
  }
  return payload as T;
}

/** Query for one page of an offset-paged endpoint. One extra row is requested to detect more pages. */
export function pageQuery(page: number, pageSize: number) {
  return { limit: Math.min(pageSize + 1, 100), offset: (page - 1) * pageSize };
}

/**
 * Normalizes an offset-paged list response requested with `pageQuery`. Envelopes such as
 * `{ items, total_count }` give the exact total; for a bare array (or an envelope without a total)
 * the extra row only tells us whether a next page exists.
 */
export function toPaginated<TRaw, T>(
  raw: unknown,
  page: number,
  pageSize: number,
  map: (item: TRaw) => T,
): PaginatedResult<T> {
  if (Array.isArray(raw)) {
    const hasMore = raw.length > pageSize;
    const items = (raw.slice(0, pageSize) as TRaw[]).map(map);
    const seen = (page - 1) * pageSize + items.length;
    return { items, page, pageSize, total: hasMore ? seen + 1 : seen, totalExact: !hasMore };
  }
  const envelope = (raw ?? {}) as Record<string, unknown>;
  const list = listItems<TRaw>(raw);
  const total = Number(envelope.total_count ?? envelope.total ?? envelope.count ?? NaN);
  const items = list.slice(0, pageSize).map(map);
  if (Number.isFinite(total)) return { items, page, pageSize, total, totalExact: true };
  const hasMore = list.length > pageSize;
  const seen = (page - 1) * pageSize + items.length;
  return { items, page, pageSize, total: hasMore ? seen + 1 : seen, totalExact: !hasMore };
}

/** Items from a list response, whether it is a bare array or an `{ items }` envelope. */
export function listItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const envelope = (raw ?? {}) as Record<string, unknown>;
  return (envelope.items ?? envelope.data ?? envelope.results ?? []) as T[];
}

/** Pages an in-memory list (for endpoints that return everything at once). */
export function paginateLocally<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const lastPage = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), lastPage);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: current,
    pageSize,
    totalExact: true,
  };
}

/** Backend timestamps without a zone are UTC; normalize them to ISO strings with `Z`. */
export function utc(value: string | null | undefined): string | null {
  if (!value) return null;
  return /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
}
