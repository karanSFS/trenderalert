import { NextResponse, type NextRequest } from "next/server";
import { backendAuth, BackendError, resolveAdminRole, toAdminIdentity } from "@/server/backendAuth";
import { errorResponse, toErrorResponse } from "@/server/routeErrors";
import {
  clearSessionCookies,
  needsRefresh,
  readSessionCookies,
  writeSessionCookies,
} from "@/server/sessionCookies";
import type { AdminIdentity } from "@/types/auth";

/** Returns the signed-in administrator, refreshing the access token when it is about to expire. */
export async function GET(request: NextRequest) {
  const { accessToken, refreshToken } = readSessionCookies(request);
  if (!accessToken && !refreshToken) return NextResponse.json({ admin: null });

  const signedOut = () => {
    const response = NextResponse.json({ admin: null });
    clearSessionCookies(response);
    return response;
  };

  try {
    let tokens: { access_token: string; refresh_token: string } | null = null;
    let access = accessToken;
    if (needsRefresh(accessToken)) {
      if (!refreshToken) return signedOut();
      tokens = await backendAuth.refresh(refreshToken);
      access = tokens.access_token;
    }
    if (!access) return signedOut();

    const user = await backendAuth.me(access);
    const role = user.account_status === "ACTIVE" ? await resolveAdminRole(user, access) : null;
    if (!role) return signedOut();

    const response = NextResponse.json<{ admin: AdminIdentity }>({
      admin: toAdminIdentity(user, role),
    });
    if (tokens) writeSessionCookies(response, tokens);
    return response;
  } catch (error) {
    if (error instanceof BackendError && (error.status === 401 || error.status === 403)) {
      return signedOut();
    }
    if (error instanceof BackendError) return toErrorResponse(error);
    return errorResponse("UNKNOWN", "The session could not be checked.", 500);
  }
}
