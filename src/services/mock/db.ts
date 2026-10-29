import {
  CONFIGURATION,
  CONTENT,
  CONTESTS,
  COPYRIGHT_CASES,
  DISCOVERY_CONFIG,
  OPERATIONS_SNAPSHOT,
  RECONCILIATION_RECORDS,
  SUBSCRIPTIONS,
  SUPPORT_CASES,
  TRANSACTIONS,
  USERS,
} from "@/data/mock";
import type { AuditEvent } from "@/features/audit/auditTypes";
import type { ConfigurationData } from "@/features/configuration/configurationTypes";
import type { ContentItem } from "@/features/content/contentTypes";
import type { Contest } from "@/features/contests/contestsTypes";
import type { CopyrightCase } from "@/features/copyright/copyrightTypes";
import type { DiscoveryConfig } from "@/features/discovery/discoveryTypes";
import type { ReconciliationRecord, Transaction } from "@/features/finance/financeTypes";
import type { Subscription } from "@/features/subscriptions/subscriptionsTypes";
import type { SupportCase } from "@/features/support/supportTypes";
import type { PlatformUser } from "@/features/users/usersTypes";
import type { TimelineEntry } from "@/types/common";
import { MockServiceError } from "./mockDelay";

/**
 * In-memory demo database. A deep copy of the seeded datasets that mock services may change,
 * so demo actions stay consistent across modules. A page refresh restores the seed.
 */
export const db = {
  users: structuredClone(USERS) as PlatformUser[],
  content: structuredClone(CONTENT) as ContentItem[],
  copyright: structuredClone(COPYRIGHT_CASES) as CopyrightCase[],
  /** Demo audit events recorded by demo-only modules during this session. */
  auditHistory: [] as AuditEvent[],
  contests: structuredClone(CONTESTS) as Contest[],
  subscriptions: structuredClone(SUBSCRIPTIONS) as Subscription[],
  transactions: structuredClone(TRANSACTIONS) as Transaction[],
  reconciliation: structuredClone(RECONCILIATION_RECORDS) as ReconciliationRecord[],
  support: structuredClone(SUPPORT_CASES) as SupportCase[],
  discovery: structuredClone(DISCOVERY_CONFIG) as DiscoveryConfig,
  configuration: structuredClone(CONFIGURATION) as ConfigurationData,
  operations: structuredClone(OPERATIONS_SNAPSHOT),
};

// Ledger entries linked to an unresolved reconciliation exception are flagged as such.
for (const record of db.reconciliation) {
  if (record.status === "resolved" || !record.transactionId) continue;
  const transaction = db.transactions.find((item) => item.id === record.transactionId);
  if (transaction) transaction.reconciliation = "exception";
}

export function findOrThrow<T extends { id: string }>(items: T[], id: string, label: string): T {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) throw new MockServiceError("NOT_FOUND", `${label} ${id} was not found.`);
  return item;
}

/** Rejects an action that the current record state does not allow. */
export function assertEligible(condition: boolean, message: string): asserts condition {
  if (!condition) throw new MockServiceError("CONFLICT", message);
}

/** Rejects input that fails validation. */
export function assertValid(condition: boolean, message: string): asserts condition {
  if (!condition) throw new MockServiceError("VALIDATION", message);
}

export function assertReason(reason: string | undefined): string {
  const trimmed = reason?.trim() ?? "";
  if (trimmed.length < 10)
    throw new MockServiceError("VALIDATION", "A reason of at least 10 characters is required.");
  return trimmed;
}

let historySequence = 0;

/** Timeline entry stamped with the real time of the demo action. */
export function historyEntry(
  actor: string,
  title: string,
  detail?: string,
  tone?: TimelineEntry["tone"],
): TimelineEntry {
  historySequence += 1;
  return {
    id: `demo-${historySequence}`,
    at: new Date().toISOString(),
    actor,
    title,
    detail,
    tone,
  };
}
