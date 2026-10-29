import { NextResponse, type NextRequest } from "next/server";
import { backendAuth, BackendError, resolveAdminRole, toAdminIdentity } from "@/server/backendAuth";
import { errorResponse, toErrorResponse } from "@/server/routeErrors";
import { writeSessionCookies } from "@/server/sessionCookies";
import type { AdminIdentity } from "@/types/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return errorResponse("VALIDATION", "Enter your email and password.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!EMAIL_PATTERN.test(email))
    return errorResponse("VALIDATION", "Enter a valid email address.", 400);
  if (!password) return errorResponse("VALIDATION", "Enter your password.", 400);

  try {
    const tokens = await backendAuth.login(email, password);
    const revoke = () => backendAuth.logout(tokens.refresh_token).catch(() => undefined);

    if (tokens.user.account_status !== "ACTIVE") {
      await revoke();
      return errorResponse(
        "FORBIDDEN",
        "This account is not active. Contact a Super Administrator.",
        403,
      );
    }

    const role = await resolveAdminRole(tokens.user, tokens.access_token);
    if (!role) {
      await revoke();
      return errorResponse("FORBIDDEN", "This account does not have administrator access.", 403);
    }

    const response = NextResponse.json<{ admin: AdminIdentity }>({
      admin: toAdminIdentity(tokens.user, role),
    });
    writeSessionCookies(response, tokens);
    return response;
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      return errorResponse("FORBIDDEN", "Incorrect email or password.", 401);
    }
    return toErrorResponse(error);
  }
}
