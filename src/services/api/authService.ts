import type { AuthService } from "@/services/contracts/authService";
import { MockServiceError } from "@/services/mock/mockDelay";
import type { ServiceError } from "@/types/api";
import type { AdminIdentity } from "@/types/auth";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new MockServiceError(
      "UNAVAILABLE",
      "Could not reach the sign-in service. Check your connection.",
    );
  }
  const body = (await response.json().catch(() => null)) as { error?: ServiceError } | null;
  if (!response.ok) {
    throw new MockServiceError(
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? "The request could not be completed.",
    );
  }
  return body as T;
}

export const apiAuthService: AuthService = {
  signIn: async (credentials) => {
    const { admin } = await call<{ admin: AdminIdentity }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return admin;
  },

  getSession: async () => {
    const { admin } = await call<{ admin: AdminIdentity | null }>("/api/auth/session");
    return admin;
  },

  signOut: async () => {
    await call<{ ok: true }>("/api/auth/logout", { method: "POST" });
  },
};
