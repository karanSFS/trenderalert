import {
  APPEALS,
  AUDIT_HISTORY,
  CONTENT,
  COPYRIGHT_CASES,
  MODERATION_CASES,
  TRENDS,
  USERS,
} from "@/data/mock";
import type { Appeal } from "@/features/appeals/appealsTypes";
import type { AuditEvent } from "@/features/audit/auditTypes";
import type { ContentItem } from "@/features/content/contentTypes";
import type { CopyrightCase } from "@/features/copyright/copyrightTypes";
import type { ModerationCase } from "@/features/moderation/moderationTypes";
import type { TrendRecord } from "@/features/trends/trendsTypes";
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
  trends: structuredClone(TRENDS) as TrendRecord[],
  moderation: structuredClone(MODERATION_CASES) as ModerationCase[],
  appeals: structuredClone(APPEALS) as Appeal[],
  copyright: structuredClone(COPYRIGHT_CASES) as CopyrightCase[],
  auditHistory: structuredClone(AUDIT_HISTORY) as AuditEvent[],
};

// Report counts are derived from the cases so the two never disagree.
for (const user of db.users) {
  user.reportsReceived = db.moderation
    .filter((item) => item.accountId === user.id)
    .reduce((total, item) => total + item.reporterCount, 0);
}
for (const item of db.content) {
  const reports = db.moderation.filter((report) => report.contentId === item.id);
  if (reports.length > 0)
    item.reportCount = reports.reduce((total, report) => total + report.reporterCount, 0);
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
