import type { EntityId, IsoDateString } from "@/types/common";

export type AnnouncementAudience = "all_members" | "creators" | "premium" | "admins";
export type AnnouncementStatus = "scheduled" | "live" | "ended";

export interface Announcement {
  id: EntityId;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  startsAt: IsoDateString;
  endsAt: IsoDateString;
  status: AnnouncementStatus;
  updatedBy: string;
}

export type PolicyKind =
  "terms" | "privacy" | "community_standards" | "copyright" | "contest_rules" | "retention";

export interface PolicyVersion {
  id: EntityId;
  kind: PolicyKind;
  version: string;
  status: "draft" | "published" | "superseded";
  effectiveAt: IsoDateString | null;
  /** Material updates trigger renewed consent (AUTH-009). */
  requiresRenewedConsent: boolean;
  summary: string;
}

export interface PlatformSettings {
  /** Allowed public-discovery durations in days; 30 is the maximum (CNT14-002). */
  trendDurationsDays: number[];
  deletionGraceDays: number;
  minimumAgeSocial: number;
  minimumAgePaidContests: number;
  preExpirationWarnings: number;
  maxSavedFolders: number;
  reportRateLimitPerHour: number;
  adminSessionTimeoutMinutes: number;
}

export interface ConfigurationData {
  settings: PlatformSettings;
  announcements: Announcement[];
  policies: PolicyVersion[];
}
