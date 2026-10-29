import type { AsyncStatus, ServiceError } from "@/types/api";
import type { AdminIdentity } from "@/types/auth";

export interface AuthState {
  currentAdmin: AdminIdentity | null;
  /** True once the server session has been checked on the client. */
  sessionRestored: boolean;
  /** Set when the session check failed for a reason other than "signed out". */
  sessionError: ServiceError | null;
  signInStatus: AsyncStatus;
  signInError: ServiceError | null;
  signOutStatus: AsyncStatus;
}
