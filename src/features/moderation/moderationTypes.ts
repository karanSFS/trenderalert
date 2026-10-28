import type { CasePriority } from "@/features/dashboard/dashboardTypes";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type { CasePriority };

export type CaseStatus = "new" | "in_review" | "escalated" | "actioned" | "dismissed";
export type CaseTargetType = "content" | "account" | "message" | "room";

export type ModerationActionType =
  | "dismiss"
  | "warn"
  | "remove_content"
  | "limit_content"
  | "restrict_account"
  | "suspend_account"
  | "escalate";

export interface CaseNote {
  id: EntityId;
  at: IsoDateString;
  author: string;
  text: string;
}

export interface ModerationCase {
  id: EntityId;
  category: string;
  priority: CasePriority;
  status: CaseStatus;
  targetType: CaseTargetType;
  /** Content id when the report is about a Trend or Profile Post. */
  contentId: EntityId | null;
  /** The reported (or content-owning) account. */
  accountId: EntityId;
  reportedItemLabel: string;
  reporterCount: number;
  details: string;
  submittedAt: IsoDateString;
  assignedReviewerId: EntityId | null;
  assignedReviewerName: string | null;
  notes: CaseNote[];
  history: TimelineEntry[];
  outcome: { action: ModerationActionType; reason: string; at: IsoDateString; by: string } | null;
}

export interface ModerationFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  category?: string;
  /** "unassigned" or an admin id. */
  assignee?: string;
  /** Show only open cases (new, in review, escalated). Defaults to true. */
  openOnly?: boolean;
}

export const OPEN_CASE_STATUSES: CaseStatus[] = ["new", "in_review", "escalated"];

export const MODERATION_CATEGORIES = [
  "Spam or scams",
  "Harassment or bullying",
  "Nudity or sexual content",
  "Hate speech",
  "Misinformation",
  "Violence or threats",
  "Impersonation",
  "Other",
] as const;
