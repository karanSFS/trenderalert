import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { tokenExpiresAt } from "./backendAuth";

const ACCESS_COOKIE = "ta_access";
const REFRESH_COOKIE = "ta_refresh";
const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 60 * 60;

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function readSessionCookies(request: NextRequest) {
  return {
    accessToken: request.cookies.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: request.cookies.get(REFRESH_COOKIE)?.value ?? null,
  };
}

/** Tokens are kept in httpOnly cookies so client-side scripts can never read them. */
export function writeSessionCookies(
  response: NextResponse,
  tokens: { access_token: string; refresh_token: string },
) {
  const expiresAt = tokenExpiresAt(tokens.access_token);
  const accessMaxAge = expiresAt
    ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
    : DEFAULT_ACCESS_MAX_AGE_SECONDS;
  response.cookies.set(ACCESS_COOKIE, tokens.access_token, {
    ...baseOptions,
    maxAge: accessMaxAge,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseOptions, maxAge: 0 });
}

/** True when the access token is missing or expires within the next minute. */
export function needsRefresh(accessToken: string | null): boolean {
  if (!accessToken) return true;
  const expiresAt = tokenExpiresAt(accessToken);
  return expiresAt !== null && expiresAt - Date.now() < 60_000;
}
