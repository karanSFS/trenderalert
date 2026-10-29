import { NextResponse, type NextRequest } from "next/server";
import { backendAuth } from "@/server/backendAuth";
import { clearSessionCookies, readSessionCookies } from "@/server/sessionCookies";

/** Revokes the refresh session on the backend (best effort) and always clears the cookies. */
export async function POST(request: NextRequest) {
  const { refreshToken } = readSessionCookies(request);
  if (refreshToken) await backendAuth.logout(refreshToken).catch(() => undefined);
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
