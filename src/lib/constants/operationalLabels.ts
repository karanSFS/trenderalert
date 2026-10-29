import type {
  AnnouncementAudience,
  AnnouncementStatus,
  PolicyKind,
} from "@/features/configuration/configurationTypes";
import type {
  ApprovalState,
  ContestStatus,
  ContestType,
  DisputeStatus,
  EntryStatus,
  FundingStatus,
  PayoutStatus,
} from "@/features/contests/contestsTypes";
import type { MarketStatus } from "@/features/discovery/discoveryTypes";
import type {
  ExceptionType,
  ReconciliationState,
  ReconciliationStatus,
  ResolutionType,
  TransactionStatus,
  TransactionType,
} from "@/features/finance/financeTypes";
import type { HealthStatus } from "@/features/dashboard/dashboardTypes";
import type { IncidentSeverity, IncidentStatus } from "@/features/operations/operationsTypes";
import type {
  EntitlementStatus,
  SubscriptionStatus,
} from "@/features/subscriptions/subscriptionsTypes";
import type {
  EscalationTeam,
  SupportCategory,
  SupportStatus,
} from "@/features/support/supportTypes";
import type { SubscriptionStore } from "@/features/users/usersTypes";
import type { BadgeSpec } from "./statusLabels";

export const CONTEST_STATUS: Record<ContestStatus, BadgeSpec> = {
  draft: { label: "Draft", tone: "neutral" },
  pending_review: { label: "In review", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  active: { label: "Active", tone: "success" },
  judging: { label: "Judging", tone: "brand" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "error" },
};

export const CONTEST_TYPE_LABELS: Record<ContestType, string> = {
  free: "Free entry",
  paid: "Paid entry",
};

export const APPROVAL_STATE: Record<ApprovalState, BadgeSpec> = {
  not_required: { label: "Not required", tone: "neutral" },
  not_started: { label: "Not started", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "error" },
};

export const FUNDING_STATUS: Record<FundingStatus, BadgeSpec> = {
  not_required: { label: "Not required", tone: "neutral" },
  pending_proof: { label: "Proof pending", tone: "warning" },
  verified: { label: "Verified", tone: "success" },
};

export const PAYOUT_STATUS: Record<PayoutStatus, BadgeSpec> = {
  not_applicable: { label: "Not applicable", tone: "neutral" },
  not_started: { label: "Not started", tone: "neutral" },
  pending_verification: { label: "Winner verification pending", tone: "warning" },
  delivered: { label: "Delivered", tone: "success" },
  failed: { label: "Failed", tone: "error" },
};

export const ENTRY_STATUS: Record<EntryStatus, BadgeSpec> = {
  valid: { label: "Valid", tone: "success" },
  flagged: { label: "Flagged", tone: "warning" },
  disqualified: { label: "Disqualified", tone: "error" },
};

export const DISPUTE_STATUS: Record<DisputeStatus, BadgeSpec> = {
  open: { label: "Open", tone: "warning" },
  resolved: { label: "Resolved", tone: "success" },
};

export const SUBSCRIPTION_STATUS: Record<SubscriptionStatus, BadgeSpec> = {
  active: { label: "Active", tone: "success" },
  grace_period: { label: "Grace period", tone: "warning" },
  billing_retry: { label: "Billing retry", tone: "warning" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
  refunded: { label: "Refunded", tone: "info" },
  revoked: { label: "Revoked", tone: "error" },
};

export const ENTITLEMENT_STATUS: Record<EntitlementStatus, BadgeSpec> = {
  active: { label: "Premium active", tone: "success" },
  grace: { label: "Premium (grace)", tone: "warning" },
  inactive: { label: "No Premium", tone: "neutral" },
};

export const STORE_LABELS: Record<SubscriptionStore, string> = {
  ios: "App Store",
  android: "Google Play",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  subscription_purchase: "Purchase",
  renewal: "Renewal",
  refund: "Refund",
  chargeback: "Chargeback",
};

export const TRANSACTION_STATUS: Record<TransactionStatus, BadgeSpec> = {
  succeeded: { label: "Succeeded", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  failed: { label: "Failed", tone: "error" },
};

export const RECONCILIATION_STATE: Record<ReconciliationState, BadgeSpec> = {
  matched: { label: "Matched", tone: "success" },
  unmatched: { label: "Unmatched", tone: "warning" },
  exception: { label: "Exception", tone: "error" },
};

export const RECONCILIATION_STATUS: Record<ReconciliationStatus, BadgeSpec> = {
  open: { label: "Open", tone: "error" },
  investigating: { label: "Investigating", tone: "warning" },
  resolved: { label: "Resolved", tone: "success" },
};

export const EXCEPTION_TYPES: Record<ExceptionType, string> = {
  "Amount mismatch": "Amount mismatch",
  "Missing provider record": "Missing provider record",
  "Duplicate charge": "Duplicate charge",
  "Unmatched refund": "Unmatched refund",
};

export const RESOLUTION_LABELS: Record<ResolutionType, string> = {
  provider_record_received: "Provider record received",
  ledger_adjustment_recorded: "Ledger adjustment recorded",
  duplicate_refunded: "Duplicate refunded by the store",
  no_action_required: "No action required",
};

export const SUPPORT_STATUS: Record<SupportStatus, BadgeSpec> = {
  open: { label: "Open", tone: "info" },
  pending_member: { label: "Waiting on member", tone: "neutral" },
  escalated: { label: "Escalated", tone: "error" },
  resolved: { label: "Resolved", tone: "success" },
};

export const SUPPORT_CATEGORY_LABELS: Record<SupportCategory, string> = {
  account_access: "Account access",
  billing: "Billing",
  content: "Content",
  safety: "Safety",
  bug: "Bug report",
  privacy_request: "Privacy request",
  deletion_request: "Deletion request",
};

export const ESCALATION_LABELS: Record<EscalationTeam, string> = {
  trust_safety: "Trust & Safety",
  finance: "Finance",
  engineering: "Engineering",
  privacy: "Privacy",
};

export const MARKET_STATUS: Record<MarketStatus, BadgeSpec> = {
  active: { label: "Active", tone: "success" },
  pilot: { label: "Pilot", tone: "brand" },
  planned: { label: "Planned", tone: "neutral" },
};

export const ANNOUNCEMENT_STATUS: Record<AnnouncementStatus, BadgeSpec> = {
  scheduled: { label: "Scheduled", tone: "info" },
  live: { label: "Live", tone: "success" },
  ended: { label: "Ended", tone: "neutral" },
};

export const AUDIENCE_TARGET_LABELS: Record<AnnouncementAudience, string> = {
  all_members: "All members",
  creators: "Creators",
  premium: "Premium members",
  admins: "Administrators",
};

export const POLICY_KIND_LABELS: Record<PolicyKind, string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  community_standards: "Community Standards",
  copyright: "Copyright Policy",
  contest_rules: "Contest Official Rules",
  retention: "Data Retention",
};

export const HEALTH_STATUS: Record<HealthStatus, BadgeSpec> = {
  operational: { label: "Operational", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  down: { label: "Down", tone: "error" },
};

export const INCIDENT_SEVERITY: Record<IncidentSeverity, BadgeSpec> = {
  sev1: { label: "SEV 1", tone: "error" },
  sev2: { label: "SEV 2", tone: "warning" },
  sev3: { label: "SEV 3", tone: "info" },
};

export const INCIDENT_STATUS: Record<IncidentStatus, BadgeSpec> = {
  investigating: { label: "Investigating", tone: "warning" },
  monitoring: { label: "Monitoring", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};
