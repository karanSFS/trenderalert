import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type NoticeType = "takedown" | "counter_notice";
export type CopyrightStatus =
  "received" | "under_review" | "content_removed" | "rejected" | "restored";
export type EvidenceStatus = "received" | "verified" | "incomplete";

export interface CopyrightCase {
  id: EntityId;
  noticeType: NoticeType;
  /** Fictional claimant name. */
  claimant: string;
  workDescription: string;
  contentId: EntityId;
  accountId: EntityId;
  username: string;
  status: CopyrightStatus;
  evidenceStatus: EvidenceStatus;
  receivedAt: IsoDateString;
  responseDueAt: IsoDateString;
  history: TimelineEntry[];
}

export interface CopyrightFilters {
  status?: CopyrightStatus;
  noticeType?: NoticeType;
  evidenceStatus?: EvidenceStatus;
}

export type CopyrightResolution = "remove_content" | "reject_notice" | "restore_content";

export const OPEN_COPYRIGHT_STATUSES: CopyrightStatus[] = ["received", "under_review"];
