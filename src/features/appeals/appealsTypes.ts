import type { ModerationActionType } from "@/features/moderation/moderationTypes";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type AppealStatus = "pending" | "in_review" | "upheld" | "reversed";

export interface AppealEvidence {
  id: EntityId;
  kind: "statement" | "screenshot" | "link";
  label: string;
  summary: string;
}

export interface Appeal {
  id: EntityId;
  caseId: EntityId;
  userId: EntityId;
  username: string;
  originalDecision: {
    action: ModerationActionType;
    reason: string;
    decidedAt: IsoDateString;
    decidedBy: string;
  };
  appealReason: string;
  evidence: AppealEvidence[];
  status: AppealStatus;
  assignedReviewerName: string | null;
  submittedAt: IsoDateString;
  history: TimelineEntry[];
  decision: {
    outcome: "upheld" | "reversed";
    reason: string;
    at: IsoDateString;
    by: string;
  } | null;
}

export interface AppealFilters {
  status?: AppealStatus;
  action?: ModerationActionType;
}
