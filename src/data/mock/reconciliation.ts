import type {
  ExceptionType,
  ReconciliationRecord,
  ReconciliationStatus,
  ResolutionType,
} from "@/features/finance/financeTypes";
import type { SubscriptionStore } from "@/features/users/usersTypes";
import { addHours } from "./seed";
import { TRANSACTIONS } from "./subscriptions";

interface Plan {
  id: string;
  exceptionType: ExceptionType;
  status: ReconciliationStatus;
  provider: SubscriptionStore;
  amount: number;
  detectedAt: string;
  /** Ledger match: undefined means the provider record has no internal counterpart. */
  linkSkip?: number;
  providerAmount?: number | null;
  resolution?: { type: ResolutionType; note: string; by: string; afterHours: number; at?: string };
  investigatedBy?: string;
}

/** Open ids match the dashboard (rec-2203 to rec-2207 are unresolved; rec-2201 was resolved). */
const PLANS: Plan[] = [
  {
    id: "rec-2207",
    exceptionType: "Missing provider record",
    status: "open",
    provider: "android",
    amount: 1_299,
    detectedAt: "2026-10-27T18:20:00Z",
    linkSkip: 0,
    providerAmount: null,
  },
  {
    id: "rec-2206",
    exceptionType: "Amount mismatch",
    status: "investigating",
    provider: "ios",
    amount: 9_999,
    detectedAt: "2026-10-27T09:44:00Z",
    linkSkip: 0,
    providerAmount: 8_999,
    investigatedBy: "Marcus Bell",
  },
  {
    id: "rec-2205",
    exceptionType: "Unmatched refund",
    status: "open",
    provider: "ios",
    amount: 1_299,
    detectedAt: "2026-10-26T21:10:00Z",
    providerAmount: -1_299,
  },
  {
    id: "rec-2204",
    exceptionType: "Duplicate charge",
    status: "investigating",
    provider: "android",
    amount: 1_299,
    detectedAt: "2026-10-26T08:03:00Z",
    linkSkip: 1,
    providerAmount: 2_598,
    investigatedBy: "Marcus Bell",
  },
  {
    id: "rec-2203",
    exceptionType: "Missing provider record",
    status: "open",
    provider: "ios",
    amount: 1_299,
    detectedAt: "2026-10-25T14:37:00Z",
    linkSkip: 1,
    providerAmount: null,
  },
  {
    id: "rec-2201",
    exceptionType: "Amount mismatch",
    status: "resolved",
    provider: "ios",
    amount: 1_299,
    detectedAt: "2026-10-26T04:12:00Z",
    linkSkip: 2,
    providerAmount: 1_199,
    resolution: {
      type: "ledger_adjustment_recorded",
      note: "Store applied a regional price adjustment; recorded a linked adjustment entry.",
      by: "Marcus Bell",
      afterHours: 0,
      at: "2026-10-27T19:15:00Z",
    },
  },
  {
    id: "rec-2200",
    exceptionType: "Missing provider record",
    status: "resolved",
    provider: "android",
    amount: 1_299,
    detectedAt: "2026-10-24T11:02:00Z",
    linkSkip: 2,
    providerAmount: 1_299,
    resolution: {
      type: "provider_record_received",
      note: "Delayed webhook delivered; records now match.",
      by: "Marcus Bell",
      afterHours: 9,
    },
  },
  {
    id: "rec-2199",
    exceptionType: "Duplicate charge",
    status: "resolved",
    provider: "ios",
    amount: 1_299,
    detectedAt: "2026-10-22T16:40:00Z",
    linkSkip: 3,
    providerAmount: 2_598,
    resolution: {
      type: "duplicate_refunded",
      note: "Store refunded the duplicate; refund recorded as a separate transaction.",
      by: "Marcus Bell",
      afterHours: 30,
    },
  },
  {
    id: "rec-2198",
    exceptionType: "Unmatched refund",
    status: "resolved",
    provider: "android",
    amount: 1_299,
    detectedAt: "2026-10-20T08:15:00Z",
    providerAmount: -1_299,
    resolution: {
      type: "provider_record_received",
      note: "Matching purchase found under a migrated account.",
      by: "Avery Collins",
      afterHours: 26,
    },
  },
  {
    id: "rec-2197",
    exceptionType: "Amount mismatch",
    status: "resolved",
    provider: "android",
    amount: 9_999,
    detectedAt: "2026-10-17T13:55:00Z",
    linkSkip: 0,
    providerAmount: 9_999,
    resolution: {
      type: "no_action_required",
      note: "Currency conversion rounding in the export; no difference after settlement.",
      by: "Marcus Bell",
      afterHours: 44,
    },
  },
  {
    id: "rec-2196",
    exceptionType: "Missing provider record",
    status: "resolved",
    provider: "ios",
    amount: 9_999,
    detectedAt: "2026-10-14T09:30:00Z",
    linkSkip: 1,
    providerAmount: 9_999,
    resolution: {
      type: "provider_record_received",
      note: "Record arrived in the next settlement file.",
      by: "Marcus Bell",
      afterHours: 20,
    },
  },
];

function findTransaction(provider: SubscriptionStore, amount: number, skip: number) {
  const matches = TRANSACTIONS.filter(
    (item) => item.provider === provider && item.amount === amount && item.status === "succeeded",
  );
  return matches[skip] ?? null;
}

export const RECONCILIATION_RECORDS: readonly ReconciliationRecord[] = PLANS.map((plan) => {
  const transaction =
    plan.linkSkip === undefined ? null : findTransaction(plan.provider, plan.amount, plan.linkSkip);
  const history: ReconciliationRecord["history"] = [
    {
      id: `${plan.id}-h1`,
      at: plan.detectedAt,
      actor: "Reconciliation job",
      title: `Exception detected: ${plan.exceptionType}`,
      tone: "warning",
    },
  ];
  if (plan.investigatedBy)
    history.push({
      id: `${plan.id}-h2`,
      at: addHours(plan.detectedAt, 2),
      actor: plan.investigatedBy,
      title: "Investigation started",
      tone: "info",
    });
  const resolvedAt = plan.resolution
    ? (plan.resolution.at ?? addHours(plan.detectedAt, plan.resolution.afterHours))
    : null;
  if (plan.resolution && resolvedAt)
    history.push({
      id: `${plan.id}-h3`,
      at: resolvedAt,
      actor: plan.resolution.by,
      title: "Resolved",
      detail: plan.resolution.note,
      tone: "success",
    });

  return {
    id: plan.id,
    exceptionType: plan.exceptionType,
    status: plan.status,
    transactionId: transaction?.id ?? null,
    providerReference:
      transaction?.providerReference ??
      `${plan.provider === "ios" ? "APL" : "GPA"}-DEMO-UNMATCHED-${plan.id.slice(4)}`,
    provider: plan.provider,
    internalAmount: transaction ? transaction.amount : null,
    providerAmount: plan.providerAmount ?? null,
    detectedAt: plan.detectedAt,
    resolution:
      plan.resolution && resolvedAt
        ? {
            type: plan.resolution.type,
            note: plan.resolution.note,
            at: resolvedAt,
            by: plan.resolution.by,
          }
        : null,
    history,
  };
});
