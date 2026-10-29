import { NextResponse, type NextRequest } from "next/server";
import {
  backendAuth,
  BackendError,
  backendFetch,
  readError,
  type BackendTokens,
} from "@/server/backendAuth";
import { errorResponse, toErrorResponse } from "@/server/routeErrors";
import {
  clearSessionCookies,
  needsRefresh,
  readSessionCookies,
  writeSessionCookies,
} from "@/server/sessionCookies";

/** Backend paths the admin portal may call. Anything else is rejected before it leaves the server. */
const ALLOWED_PATHS = [
  /^api\/v1\/admin\/[a-z0-9/_-]+$/i,
  /^api\/v1\/trends\/?$/,
  /^api\/v1\/trends\/[A-Za-z0-9_-]+$/,
  /^api\/v1\/trends\/topics\/[A-Za-z0-9_-]+\/score$/,
  /^api\/v1\/radar\/journey\/[A-Za-z0-9_-]+$/,
  /^api\/v1\/radar\/heat-zones$/,
  /^health$/,
];

type Context = { params: Promise<{ path: string[] }> };

function sessionEnded() {
  const response = errorResponse("UNAUTHENTICATED", "Your session has ended. Sign in again.", 401);
  clearSessionCookies(response);
  return response;
}

/**
 * Authenticated pass-through to the TrenderAlert backend. Adds the bearer token from the
 * httpOnly cookie, refreshes it when needed (once on a 401), and maps errors to `{ error }`.
 */
async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  // Next.js strips trailing slashes; the backend's collection route for Trends needs one.
  const joined = path.join("/");
  const target = joined === "api/v1/trends" ? "api/v1/trends/" : joined;
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(target))) {
    return errorResponse("NOT_FOUND", "This API path is not available to the admin portal.", 404);
  }

  const { accessToken, refreshToken } = readSessionCookies(request);
  if (!accessToken && !refreshToken) return sessionEnded();

  let refreshed: BackendTokens | null = null;
  const refresh = async () => {
    if (!refreshToken) return null;
    try {
      refreshed = await backendAuth.refresh(refreshToken);
      return refreshed.access_token;
    } catch (error) {
      if (error instanceof BackendError && error.status < 500) return null;
      throw error;
    }
  };

  try {
    let token = needsRefresh(accessToken) ? await refresh() : accessToken;
    if (!token) return sessionEnded();

    const body =
      request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();
    const send = (bearer: string) =>
      backendFetch(`/${target}${request.nextUrl.search}`, {
        method: request.method,
        body: body || undefined,
        token: bearer,
      });

    let response = await send(token);
    if (response.status === 401 && !refreshed) {
      token = await refresh();
      if (!token) return sessionEnded();
      response = await send(token);
    }
    if (response.status === 401) return sessionEnded();

    let result: NextResponse;
    if (!response.ok) {
      const error = await readError(response);
      result = errorResponse(error.code, error.message, error.status);
    } else {
      const text = await response.text();
      result = new NextResponse(text || "null", {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (refreshed) writeSessionCookies(result, refreshed);
    return result;
  } catch (error) {
    return toErrorResponse(error);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
