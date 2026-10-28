import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type ContestType = "free" | "paid";
export type ContestStatus =
  "draft" | "pending_review" | "approved" | "active" | "judging" | "completed" | "cancelled";

/** Each approval is tracked separately and is never set from the admin UI. */
export type ApprovalState = "not_required" | "not_started" | "pending" | "approved" | "rejected";
export type FundingStatus = "not_required" | "pending_proof" | "verified";
export type PayoutStatus =
  "not_applicable" | "not_started" | "pending_verification" | "delivered" | "failed";
export type EntryStatus = "valid" | "flagged" | "disqualified";
export type DisputeStatus = "open" | "resolved";

export interface ContestEntry {
  id: EntityId;
  userId: EntityId;
  username: string;
  submittedAt: IsoDateString;
  status: EntryStatus;
  /** Judging score from the approved method (D-07), when judged. */
  score: number | null;
  flagReason: string | null;
}

export interface ContestDispute {
  id: EntityId;
  entryId: EntityId | null;
  username: string;
  openedAt: IsoDateString;
  summary: string;
  status: DisputeStatus;
  resolution: string | null;
}

export interface Contest {
  id: EntityId;
  name: string;
  type: ContestType;
  status: ContestStatus;
  sponsor: string;
  description: string;
  entryOpensAt: IsoDateString;
  entryClosesAt: IsoDateString;
  eligibility: { minimumAge: number; jurisdictions: string[]; entryLimit: number };
  prize: { description: string; valueCents: number };
  fundingStatus: FundingStatus;
  approvals: { legal: ApprovalState; paymentProvider: ApprovalState; operations: ApprovalState };
  rules: { version: string; locked: boolean; judgingMethod: string };
  payoutStatus: PayoutStatus;
  entries: ContestEntry[];
  disputes: ContestDispute[];
  history: TimelineEntry[];
}

export interface ContestFilters {
  status?: ContestStatus;
  type?: ContestType;
}

export type ContestDecision = "approve" | "request_changes" | "cancel";
