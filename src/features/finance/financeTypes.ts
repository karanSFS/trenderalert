import type { SubscriptionStore } from "@/features/users/usersTypes";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type TransactionType = "subscription_purchase" | "renewal" | "refund" | "chargeback";
export type TransactionStatus = "succeeded" | "pending" | "failed";
export type ReconciliationState = "matched" | "unmatched" | "exception";

/** Ledger entry. Records are append-only: corrections and refunds are new records. */
export interface Transaction {
  id: EntityId;
  type: TransactionType;
  /** Minor units (cents). Negative for refunds and chargebacks. */
  amount: number;
  currency: "USD";
  provider: SubscriptionStore;
  providerReference: string;
  status: TransactionStatus;
  userId: EntityId;
  username: string;
  subscriptionId: EntityId | null;
  occurredAt: IsoDateString;
  /** For refunds and chargebacks: the transaction they reverse. */
  relatedTransactionId: EntityId | null;
  /** For purchases that were later refunded. */
  refundedBy: EntityId | null;
  reconciliation: ReconciliationState;
  note: string | null;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  provider?: SubscriptionStore;
  reconciliation?: ReconciliationState;
}

export type ExceptionType =
  "Amount mismatch" | "Missing provider record" | "Duplicate charge" | "Unmatched refund";
export type ReconciliationStatus = "open" | "investigating" | "resolved";
export type ResolutionType =
  | "provider_record_received"
  | "ledger_adjustment_recorded"
  | "duplicate_refunded"
  | "no_action_required";

export interface ReconciliationRecord {
  id: EntityId;
  exceptionType: ExceptionType;
  status: ReconciliationStatus;
  transactionId: EntityId | null;
  providerReference: string;
  provider: SubscriptionStore;
  internalAmount: number | null;
  providerAmount: number | null;
  detectedAt: IsoDateString;
  resolution: { type: ResolutionType; note: string; at: IsoDateString; by: string } | null;
  history: TimelineEntry[];
}

export interface ReconciliationFilters {
  status?: ReconciliationStatus;
  exceptionType?: ExceptionType;
  provider?: SubscriptionStore;
}

export interface FinanceOverview {
  periodDays: number;
  grossCents: number;
  refundsCents: number;
  chargebacksCents: number;
  openExceptions: number;
  pendingTransactions: number;
  byProvider: { provider: SubscriptionStore; grossCents: number; count: number }[];
  contestPayouts: { enabled: boolean; note: string };
}
