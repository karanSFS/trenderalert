import type { AdminRole, DemoAdminAccount } from "@/types/auth";

/**
 * Contract shared by the mock implementation and the future backend implementation.
 * Production sign-in will replace `signInDemo` with a credential or SSO flow (proposed, not final).
 */
export interface AuthService {
  listDemoAccounts(): Promise<DemoAdminAccount[]>;
  signInDemo(accountId: string): Promise<DemoAdminAccount>;
  getDemoAccountForRole(role: AdminRole): Promise<DemoAdminAccount>;
  restoreDemoSession(accountId: string): Promise<DemoAdminAccount>;
}
