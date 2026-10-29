import type { AppealStatus } from "@/features/appeals/appealsTypes";
import type {
  ModerationAction,
  ModerationReport,
  ReportCategory,
  ReportStatus,
} from "@/features/moderation/moderationTypes";
import type { BadgeSpec } from "./statusLabels";

export const REPORT_STATUS: Record<ReportStatus, BadgeSpec> = {
  OPEN: { label: "Open", tone: "info" },
  IN_REVIEW: { label: "In review", tone: "warning" },
  ACTION_TAKEN: { label: "Action taken", tone: "success" },
  DISMISSED: { label: "Dismissed", tone: "neutral" },
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  HARASSMENT: "Harassment",
  HATE: "Hate",
  COPYRIGHT: "Copyright",
  MINOR_SAFETY: "Minor safety",
  IMMINENT_HARM: "Imminent harm",
  SPAM: "Spam",
};

export const categoryLabel = (category: string) =>
  REPORT_CATEGORY_LABELS[category as ReportCategory] ?? category;

/** Backend priority 1 (most urgent) to 5, with SLA hours from `GET /admin/meta/values`. */
export const PRIORITY_LEVEL: Record<number, BadgeSpec & { slaHours: number }> = {
  1: { label: "P1 · 1 h SLA", tone: "error", slaHours: 1 },
  2: { label: "P2 · 4 h SLA", tone: "error", slaHours: 4 },
  3: { label: "P3 · 12 h SLA", tone: "warning", slaHours: 12 },
  4: { label: "P4 · 24 h SLA", tone: "info", slaHours: 24 },
  5: { label: "P5 · 48 h SLA", tone: "neutral", slaHours: 48 },
};

export const priorityBadge = (priority: number): BadgeSpec => {
  const level = PRIORITY_LEVEL[priority];
  return level
    ? { label: level.label, tone: level.tone }
    : { label: `P${priority}`, tone: "neutral" };
};

export const PRIORITY_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: PRIORITY_LEVEL[value].label,
}));

interface ActionSpec {
  label: string;
  danger: boolean;
  consequences: string[];
  /** Which target the action needs on the report. */
  needs: "user" | "trend" | null;
}

export const MODERATION_ACTIONS: Record<ModerationAction, ActionSpec> = {
  DISMISS: {
    label: "Dismiss report",
    danger: false,
    needs: null,
    consequences: ["Closes the report with no enforcement."],
  },
  WARN: {
    label: "Warn member",
    danger: false,
    needs: "user",
    consequences: ["Sends a policy warning to the reported member.", "Closes the report."],
  },
  SUPPRESS_CONTENT: {
    label: "Suppress content",
    danger: true,
    needs: "trend",
    consequences: [
      "Removes the reported Trend from discovery.",
      "Closes the report; the creator can appeal.",
    ],
  },
  RESTRICT_FEATURE: {
    label: "Restrict features",
    danger: true,
    needs: "user",
    consequences: ["Limits what the member can do on the platform.", "The member can appeal."],
  },
  SUSPEND_USER: {
    label: "Suspend member",
    danger: true,
    needs: "user",
    consequences: [
      "The member cannot use their account while suspended.",
      "The member can appeal.",
    ],
  },
  BAN_USER: {
    label: "Ban member",
    danger: true,
    needs: "user",
    consequences: ["Permanently bans the account.", "The member can appeal."],
  },
};

export const MODERATION_ACTION_ORDER: ModerationAction[] = [
  "DISMISS",
  "WARN",
  "SUPPRESS_CONTENT",
  "RESTRICT_FEATURE",
  "SUSPEND_USER",
  "BAN_USER",
];

/** Why an action is unavailable on this report, or null when it can be taken. */
export function moderationActionBlock(
  report: ModerationReport,
  action: ModerationAction,
): string | null {
  if (report.status === "ACTION_TAKEN" || report.status === "DISMISSED")
    return "This report is already resolved.";
  const needs = MODERATION_ACTIONS[action].needs;
  if (needs === "user" && !report.targetUserId) return "This report has no reported account.";
  if (needs === "trend" && !report.targetTrendId) return "This report has no reported Trend.";
  return null;
}

export const APPEAL_STATUS: Record<AppealStatus, BadgeSpec> = {
  SUBMITTED: { label: "Submitted", tone: "info" },
  IN_REVIEW: { label: "In review", tone: "warning" },
  UPHELD: { label: "Upheld", tone: "neutral" },
  OVERTURNED: { label: "Overturned", tone: "success" },
};
