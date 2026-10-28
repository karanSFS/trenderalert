import type { CasePriority } from "@/features/dashboard/dashboardTypes";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type SupportCategory =
  | "account_access"
  | "billing"
  | "content"
  | "safety"
  | "bug"
  | "privacy_request"
  | "deletion_request";

export type SupportStatus = "open" | "pending_member" | "escalated" | "resolved";
export type EscalationTeam = "trust_safety" | "finance" | "engineering" | "privacy";

export interface SupportNote {
  id: EntityId;
  at: IsoDateString;
  author: string;
  text: string;
}

export interface SupportCase {
  id: EntityId;
  subject: string;
  category: SupportCategory;
  priority: CasePriority;
  status: SupportStatus;
  userId: EntityId;
  username: string;
  /** Masked contact (ADMIN-006); full addresses are never shown to support. */
  maskedContact: string;
  assignedAgentId: EntityId | null;
  assignedAgentName: string | null;
  escalatedTo: EscalationTeam | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  summary: string;
  notes: SupportNote[];
  history: TimelineEntry[];
}

export interface SupportFilters {
  status?: SupportStatus;
  category?: SupportCategory;
  priority?: CasePriority;
  assignee?: string;
}
