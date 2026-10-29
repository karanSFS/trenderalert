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
import type { TrendCategory, TrendStage } from "@/features/trends/trendsTypes";
import type { AccountStatus, SubscriptionPlan } from "@/features/users/usersTypes";
import type { Option, StatusTone } from "@/types/common";

export interface BadgeSpec {
  label: string;
  tone: StatusTone;
}

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  premium_monthly: "Premium monthly",
  premium_yearly: "Premium yearly",
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
  SIGNAL: { label: "Signal", tone: "info" },
  EMERGING: { label: "Emerging", tone: "info" },
  RISING: { label: "Rising", tone: "success" },
  BREAKING: { label: "Breaking", tone: "brand" },
  REGIONAL: { label: "Regional", tone: "brand" },
  NATIONAL: { label: "National", tone: "brand" },
  GLOBAL: { label: "Global", tone: "brand" },
  MAINSTREAM: { label: "Mainstream", tone: "warning" },
  COOLING: { label: "Cooling", tone: "neutral" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
  DISQUALIFIED: { label: "Disqualified", tone: "error" },
};

/** Stage badge that tolerates values the portal does not know yet. */
export const trendStageBadge = (stage: string): BadgeSpec =>
  TREND_STAGE[stage as TrendStage] ?? { label: stage, tone: "neutral" };

export const TREND_CATEGORY_OPTIONS: Option<TrendCategory>[] = (
  [
    "Food & Drink",
    "Fashion",
    "Style",
    "Music",
    "Tech",
    "Wellness",
    "Culture",
    "Community",
    "Sports",
  ] as const
).map((value) => ({ value, label: value }));

export const PRIORITY: Record<CasePriority, BadgeSpec> = {
  critical: { label: "Critical", tone: "error" },
  high: { label: "High", tone: "warning" },
  medium: { label: "Medium", tone: "info" },
  low: { label: "Low", tone: "neutral" },
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

/** Backend account statuses for the user directory. */
export const ACCOUNT_STATUS: Record<AccountStatus, BadgeSpec> = {
  ACTIVE: { label: "Active", tone: "success" },
  PENDING_VERIFICATION: { label: "Pending verification", tone: "info" },
  SUSPENDED: { label: "Suspended", tone: "warning" },
  BANNED: { label: "Banned", tone: "error" },
};

export const accountStatusBadge = (status: string): BadgeSpec =>
  ACCOUNT_STATUS[status as AccountStatus] ?? { label: status, tone: "neutral" };
