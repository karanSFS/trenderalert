import type { EntityId, IsoDateString } from "@/types/common";

export type UserStatus = "active" | "restricted" | "suspended" | "pending_deletion";
export type SubscriptionPlan = "free" | "premium_monthly" | "premium_yearly";
export type SubscriptionStore = "ios" | "android";
export type VerificationStatus = "verified" | "pending" | "unverified";

export interface UserEnforcement {
  action: "restricted" | "suspended" | "warned" | "reinstated";
  at: IsoDateString;
  by: string;
  reason: string;
}

export interface PlatformUser {
  id: EntityId;
  username: string;
  displayName: string;
  /** Fictional `.test` address; real contact data is never shown in the demo. */
  email: string;
  registeredAt: IsoDateString;
  /** Approximate area only (D-03). */
  approximateLocation: string;
  status: UserStatus;
  subscription: {
    plan: SubscriptionPlan;
    store: SubscriptionStore | null;
    renewsAt: IsoDateString | null;
  };
  verification: VerificationStatus;
  followers: number;
  trendsPublished: number;
  reportsReceived: number;
  strikes: number;
  lastEnforcement: UserEnforcement | null;
  /** Present while a deletion request is in its grace period (D-10). */
  deletion: { requestedAt: IsoDateString; scheduledFor: IsoDateString } | null;
}

export interface UserFilters {
  status?: UserStatus;
  plan?: SubscriptionPlan;
  verification?: VerificationStatus;
}

export type UserEnforcementAction = "restrict" | "suspend" | "reinstate";
