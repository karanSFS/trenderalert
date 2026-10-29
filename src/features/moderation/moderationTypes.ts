import type { EntityId, IsoDateString } from "@/types/common";

/** Values defined by the backend (`ModerationStatusEnum`, `ModerationCategoryEnum`). */
export type ReportStatus = "OPEN" | "IN_REVIEW" | "ACTION_TAKEN" | "DISMISSED";
export type ReportCategory =
  "HARASSMENT" | "HATE" | "COPYRIGHT" | "MINOR_SAFETY" | "IMMINENT_HARM" | "SPAM";

/** Actions accepted by `POST /admin/moderation/queue/{id}/action`. */
export type ModerationAction =
  "WARN" | "SUPPRESS_CONTENT" | "RESTRICT_FEATURE" | "SUSPEND_USER" | "BAN_USER" | "DISMISS";

export interface ModerationReport {
  id: EntityId;
  targetTrendId: EntityId | null;
  targetUserId: EntityId | null;
  /** Usually a `ReportCategory`; unknown values from the backend are shown as-is. */
  category: string;
  /** 1 (most urgent) to 5. */
  priority: number;
  assignedAdminId: EntityId | null;
  assignedAdminName: string | null;
  assignedAdminEmail: string | null;
  slaDueAt: IsoDateString;
  moderatorNotes: string | null;
  status: ReportStatus;
  createdAt: IsoDateString;
  resolvedAt: IsoDateString | null;
}

export interface ModerationFilters {
  status?: ReportStatus;
  category?: ReportCategory;
  /** "1" to "5" (kept as a string for the filter select). */
  priority?: string;
}

export const OPEN_REPORT_STATUSES: ReportStatus[] = ["OPEN", "IN_REVIEW"];

export const isReportOpen = (report: ModerationReport) =>
  OPEN_REPORT_STATUSES.includes(report.status);

/** Open report whose SLA deadline has passed. */
export const isSlaBreached = (report: ModerationReport, now = Date.now()) =>
  isReportOpen(report) && Date.parse(report.slaDueAt) < now;
