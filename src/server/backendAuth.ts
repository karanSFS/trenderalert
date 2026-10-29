import "server-only";
import type { AdminIdentity, AdminRole } from "@/types/auth";
import type { ServiceError, ServiceErrorCode } from "@/types/api";

/**
 * Server-side client for the TrenderAlert backend authentication API. Only route handlers use
 * it; access and refresh tokens never reach browser JavaScript.
 */

const BACKEND_ROLE_MAP: Record<string, AdminRole> = {
  SUPER_ADMIN: "super_admin",
  CONTENT_MODERATOR: "content_moderator",
  SUPPORT_AGENT: "support_agent",
  FINANCE_ADMIN: "finance_admin",
  CONTEST_ADMIN: "contest_admin",
};

export interface BackendUser {
  user_id: string;
  email?: string | null;
  username: string;
  display_name: string;
  account_status: string;
  role?: string | null;
  admin_role?: string | null;
}

export interface BackendTokens {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
}

interface BackendErrorBody {
  message?: string;
  detail?: unknown;
  details?: { field?: string; message?: string }[] | null;
}

export class BackendError extends Error implements ServiceError {
  constructor(
    readonly code: ServiceErrorCode,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

function baseUrl(): string {
  const url = process.env.TRENDERALERT_API_URL?.trim();
  if (!url) {
    throw new BackendError(
      "UNAVAILABLE",
      "The sign-in service is not configured. Set TRENDERALERT_API_URL on the server.",
      503,
    );
  }
  return url.replace(/\/+$/, "");
}

function codeForStatus(status: number): ServiceErrorCode {
  if (status === 401 || status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status >= 500) return "UNAVAILABLE";
  return "UNKNOWN";
}

async function readError(response: Response): Promise<BackendError> {
  let body: BackendErrorBody | null = null;
  try {
    body = (await response.json()) as BackendErrorBody;
  } catch {
    body = null;
  }
  const fieldMessage = body?.details?.find((item) => item.message)?.message;
  const message =
    fieldMessage ??
    body?.message ??
    (typeof body?.detail === "string" ? body.detail : null) ??
    `The backend responded with status ${response.status}.`;
  return new BackendError(codeForStatus(response.status), message, response.status);
}

async function request<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...rest,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "application/json",
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    if (error instanceof BackendError) throw error;
    throw new BackendError(
      "UNAVAILABLE",
      "The sign-in service could not be reached. Try again.",
      503,
    );
  }
  if (!response.ok) throw await readError(response);
  return (await response.json()) as T;
}

export const backendAuth = {
  login: (email: string, password: string) =>
    request<BackendTokens>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<BackendTokens>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  me: (accessToken: string) => request<BackendUser>("/api/v1/auth/me", { token: accessToken }),

  logout: (refreshToken: string) =>
    request<unknown>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};

/** Reads the unverified JWT payload. Used only for expiry and optional claims; the backend verifies. */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function tokenExpiresAt(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" ? exp * 1000 : null;
}

function mapRole(value: unknown): AdminRole | null {
  return typeof value === "string" ? (BACKEND_ROLE_MAP[value.toUpperCase()] ?? null) : null;
}

/**
 * Resolves the administrator role for the signed-in user, in order of preference:
 * 1. a `role` or `admin_role` field on the user (not returned by the backend yet);
 * 2. a `role` claim in the access token (not issued yet);
 * 3. `GET /api/v1/admin/roles`, which returns every assignment but only to Super Admins;
 * 4. the role named in that endpoint's 403 message for other roles.
 * Step 4 is an interim workaround until the backend exposes the caller's own role.
 */
export async function resolveAdminRole(
  user: BackendUser,
  accessToken: string,
): Promise<AdminRole | null> {
  const direct = mapRole(user.role) ?? mapRole(user.admin_role);
  if (direct) return direct;

  const claims = decodeJwtPayload(accessToken);
  const claimed = mapRole(claims?.role) ?? mapRole(claims?.admin_role);
  if (claimed) return claimed;

  try {
    const assignments = await request<{ user_id: string; role_name: string; is_active: boolean }[]>(
      "/api/v1/admin/roles",
      { token: accessToken },
    );
    const own = assignments.find((item) => item.user_id === user.user_id && item.is_active);
    return mapRole(own?.role_name);
  } catch (error) {
    if (error instanceof BackendError && error.status === 403) {
      const named = /Role '([A-Z_]+)'/.exec(error.message)?.[1];
      return mapRole(named);
    }
    throw error;
  }
}

export function toAdminIdentity(user: BackendUser, role: AdminRole): AdminIdentity {
  return {
    id: user.user_id,
    displayName: user.display_name || user.username,
    email: user.email ?? "",
    username: user.username,
    role,
  };
}
