import type { AsyncStatus, ServiceError } from "@/types/api";
import type { DemoAdminAccount } from "@/types/auth";

export interface AuthState {
  currentAdmin: DemoAdminAccount | null;
  /** True once any saved demo session has been checked on the client. */
  sessionRestored: boolean;
  signInStatus: AsyncStatus;
  signInError: ServiceError | null;
  roleSwitchStatus: AsyncStatus;
  demoAccounts: DemoAdminAccount[];
  demoAccountsStatus: AsyncStatus;
  demoAccountsError: ServiceError | null;
}

export interface DemoSessionSnapshot {
  accountId: string;
}
