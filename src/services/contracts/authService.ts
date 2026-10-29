import type { AdminIdentity, SignInCredentials } from "@/types/auth";

/**
 * Administrator authentication. Implemented by `services/api/authService.ts`, which calls the
 * app's own `/api/auth/*` route handlers; those talk to the backend and hold the tokens in
 * httpOnly cookies.
 */
export interface AuthService {
  signIn(credentials: SignInCredentials): Promise<AdminIdentity>;
  /** Returns the current administrator, or null when no valid session exists. */
  getSession(): Promise<AdminIdentity | null>;
  signOut(): Promise<void>;
}
