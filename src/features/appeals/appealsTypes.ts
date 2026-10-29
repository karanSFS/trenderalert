import type { EntityId, IsoDateString } from "@/types/common";

/** Backend `AppealStatusEnum`. */
export type AppealStatus = "SUBMITTED" | "IN_REVIEW" | "UPHELD" | "OVERTURNED";
export type AppealOutcome = "UPHELD" | "OVERTURNED";

export interface Appeal {
  id: EntityId;
  /** The moderation report the appeal challenges. */
  reportId: EntityId;
  appellantUserId: EntityId;
  appellantName: string | null;
  appellantEmail: string | null;
  statement: string;
  evidenceAssets: string[];
  assignedAdminId: EntityId | null;
  status: AppealStatus;
  resolutionReason: string | null;
  submittedAt: IsoDateString;
  resolvedAt: IsoDateString | null;
}

export interface AppealFilters {
  status?: AppealStatus;
}

export const isAppealOpen = (appeal: Appeal) =>
  appeal.status === "SUBMITTED" || appeal.status === "IN_REVIEW";
