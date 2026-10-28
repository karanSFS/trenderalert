import { DEMO_ADMIN_ACCOUNTS } from "@/data/mock";
import type { AuthService } from "@/services/contracts/authService";
import { MockServiceError, mockRequest } from "./mockDelay";

function findAccount(accountId: string) {
  const account = DEMO_ADMIN_ACCOUNTS.find((candidate) => candidate.id === accountId);
  if (!account) throw new MockServiceError("NOT_FOUND", "That demo account does not exist.");
  return account;
}

export const mockAuthService: AuthService = {
  listDemoAccounts: () => mockRequest(() => DEMO_ADMIN_ACCOUNTS, { service: "auth" }),

  signInDemo: (accountId) => mockRequest(() => findAccount(accountId), { service: "auth" }),

  getDemoAccountForRole: (role) =>
    mockRequest(
      () => {
        const account = DEMO_ADMIN_ACCOUNTS.find((candidate) => candidate.role === role);
        if (!account)
          throw new MockServiceError("NOT_FOUND", "No demo account exists for that role.");
        return account;
      },
      { service: "auth" },
    ),

  restoreDemoSession: (accountId) =>
    mockRequest(() => findAccount(accountId), { service: "auth", delayMs: 0 }),
};
