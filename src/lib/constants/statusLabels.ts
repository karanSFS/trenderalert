import type { AppealStatus } from "@/features/appeals/appealsTypes";
import type {
  Audience,
  ContentModerationStatus,
  ContentType,
} from "@/features/content/contentTypes";
import type {
  CopyrightStatus,
  EvidenceStatus,
  NoticeType,
} from "@/features/copyright/copyrightTypes";
import type { CasePriority } from "@/features/dashboard/dashboardTypes";
import type {
  CaseStatus,
  CaseTargetType,
  ModerationActionType,
} from "@/features/moderation/moderationTypes";
import type { GeoScope, TrendStage } from "@/features/trends/trendsTypes";
import type { SubscriptionPlan, UserStatus, VerificationStatus } from "@/features/users/usersTypes";
import type { Option, StatusTone } from "@/types/common";

export interface BadgeSpec {
  label: string;
  tone: StatusTone;
}

export const USER_STATUS: Record<UserStatus, BadgeSpec> = {
  active: { label: "Active", tone: "success" },
  restricted: { label: "Restricted", tone: "warning" },
  suspended: { label: "Suspended", tone: "error" },
  pending_deletion: { label: "Pending deletion", tone: "neutral" },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  premium_monthly: "Premium monthly",
  premium_yearly: "Premium yearly",
};

export const VERIFICATION: Record<VerificationStatus, BadgeSpec> = {
  verified: { label: "Verified", tone: "info" },
  pending: { label: "Verification pending", tone: "warning" },
  unverified: { label: "Unverified", tone: "neutral" },
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  trend: "Trend",
  profile_post: "Profile Post",
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  everyone: "Everyone",
  followers: "Followers",
  trenders: "Trenders",
  selected: "Selected People",
  only_me: "Only Me",
};

export const CONTENT_STATUS: Record<ContentModerationStatus, BadgeSpec> = {
  visible: { label: "Visible", tone: "success" },
  under_review: { label: "Under review", tone: "warning" },
  limited: { label: "Limited", tone: "warning" },
  removed: { label: "Removed", tone: "error" },
};

export const TREND_STAGE: Record<TrendStage, BadgeSpec> = {
  spark: { label: "Spark", tone: "info" },
  rising: { label: "Rising", tone: "success" },
  hot: { label: "Hot", tone: "brand" },
  peaking: { label: "Peaking", tone: "warning" },
  cooling: { label: "Cooling", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
  ended_early: { label: "Ended early", tone: "error" },
};

export const GEO_SCOPE_LABELS: Record<GeoScope, string> = {
  near: "Near You",
  city: "City",
  region: "Region",
  nationwide: "Nationwide",
  global: "Global",
};

export const CASE_STATUS: Record<CaseStatus, BadgeSpec> = {
  new: { label: "New", tone: "info" },
  in_review: { label: "In review", tone: "warning" },
  escalated: { label: "Escalated", tone: "error" },
  actioned: { label: "Actioned", tone: "success" },
  dismissed: { label: "Dismissed", tone: "neutral" },
};

export const PRIORITY: Record<CasePriority, BadgeSpec> = {
  critical: { label: "Critical", tone: "error" },
  high: { label: "High", tone: "warning" },
  medium: { label: "Medium", tone: "info" },
  low: { label: "Low", tone: "neutral" },
};

export const TARGET_TYPE_LABELS: Record<CaseTargetType, string> = {
  content: "Content",
  account: "Account",
  message: "Message",
  room: "Trend Room",
};

export const MODERATION_ACTION_LABELS: Record<ModerationActionType, string> = {
  dismiss: "Dismiss report",
  warn: "Issue warning",
  remove_content: "Remove content",
  limit_content: "Limit content visibility",
  restrict_account: "Restrict account",
  suspend_account: "Suspend account",
  escalate: "Escalate",
};

export const APPEAL_STATUS: Record<AppealStatus, BadgeSpec> = {
  pending: { label: "Pending", tone: "info" },
  in_review: { label: "In review", tone: "warning" },
  upheld: { label: "Upheld", tone: "neutral" },
  reversed: { label: "Reversed", tone: "success" },
};

export const COPYRIGHT_STATUS: Record<CopyrightStatus, BadgeSpec> = {
  received: { label: "Received", tone: "info" },
  under_review: { label: "Under review", tone: "warning" },
  content_removed: { label: "Content removed", tone: "error" },
  rejected: { label: "Notice rejected", tone: "neutral" },
  restored: { label: "Content restored", tone: "success" },
};

export const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  takedown: "Takedown notice",
  counter_notice: "Counter-notice",
};

export const EVIDENCE_STATUS: Record<EvidenceStatus, BadgeSpec> = {
  received: { label: "Received", tone: "info" },
  verified: { label: "Verified", tone: "success" },
  incomplete: { label: "Incomplete", tone: "warning" },
};

/** Builds Select options from a label map. */
export function toOptions<K extends string>(map: Record<K, string | BadgeSpec>): Option<K>[] {
  return (Object.entries(map) as [K, string | BadgeSpec][]).map(([value, entry]) => ({
    value,
    label: typeof entry === "string" ? entry : entry.label,
  }));
}
