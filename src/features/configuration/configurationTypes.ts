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

export type FlagGateId =
  | "legal"
  | "payment_provider"
  | "store_policy"
  | "fraud_controls"
  | "official_rules"
  | "operations"
  | "data_quality"
  | "safety_review";

export interface FlagGate {
  id: FlagGateId;
  label: string;
  /** Only the backend records gates; the demo shows them read-only. */
  satisfied: boolean;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  /** Percent of the selected audience, 0-100. */
  rollout: number;
  audience: string;
  owner: string;
  activationGated: boolean;
  gates: FlagGate[];
  updatedAt: IsoDateString;
  updatedBy: string;
}

export interface ConfigurationData {
  settings: PlatformSettings;
  announcements: Announcement[];
  policies: PolicyVersion[];
  flags: FeatureFlag[];
}
