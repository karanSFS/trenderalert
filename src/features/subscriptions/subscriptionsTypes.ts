import type { SubscriptionPlan, SubscriptionStore } from "@/features/users/usersTypes";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type SubscriptionStatus =
  "active" | "grace_period" | "billing_retry" | "cancelled" | "expired" | "refunded" | "revoked";

export type EntitlementStatus = "active" | "grace" | "inactive";

export interface Subscription {
  id: EntityId;
  userId: EntityId;
  username: string;
  plan: Exclude<SubscriptionPlan, "free">;
  store: SubscriptionStore;
  /** Opaque store reference; never a payment credential. */
  storeReference: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
  startedAt: IsoDateString;
  currentPeriodEnd: IsoDateString;
  entitlement: EntitlementStatus;
  history: TimelineEntry[];
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  plan?: Exclude<SubscriptionPlan, "free">;
  store?: SubscriptionStore;
}
