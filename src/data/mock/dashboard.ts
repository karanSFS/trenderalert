import type {
  ActivityItem,
  BreakdownItem,
  DashboardAlert,
  FinancialException,
  PendingCase,
  ServiceHealth,
} from "@/features/dashboard/dashboardTypes";

/**
 * Fictional dashboard data. Everything is generated from a fixed seed and a fixed reference
 * date so the demo is identical on every run. None of it reflects real platform activity.
 */
export const DEMO_AS_OF = "2026-10-28T00:00:00Z";

export const DASHBOARD_HISTORY_DAYS = 180;
export const BASE_REGISTERED_USERS = 184_200;

export interface DashboardDailyRecord {
  date: string;
  registrations: number;
  newTrends: number;
  expiredTrends: number;
  activeTrends: number;
  pendingModeration: number;
  activeContests: number;
  premiumSubscriptions: number;
  openExceptions: number;
  /** Minor units (cents). */
  subscriptionRevenue: number;
  refunds: number;
}

/** Mulberry32: small deterministic pseudo-random generator. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_MS = 86_400_000;

function generateDaily(): DashboardDailyRecord[] {
  const random = seededRandom(20261028);
  const jitter = (spread: number) => 1 + (random() - 0.5) * 2 * spread;
  const end = Date.parse(DEMO_AS_OF);
  const records: DashboardDailyRecord[] = [];

  let activeTrends = 10_400;
  let premium = 8_150;
  let pending = 140;
  let exceptions = 6;

  for (let index = 0; index < DASHBOARD_HISTORY_DAYS; index += 1) {
    const day = new Date(end - (DASHBOARD_HISTORY_DAYS - index) * DAY_MS);
    const progress = index / DASHBOARD_HISTORY_DAYS;
    const weekday = day.getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 1.16 : 1;

    const registrations = Math.round((360 + 260 * progress) * weekend * jitter(0.12));
    const newTrends = Math.round((880 + 420 * progress) * weekend * jitter(0.1));
    const expiredTrends = Math.round(newTrends * (0.93 + random() * 0.06));
    activeTrends += newTrends - expiredTrends;

    premium += Math.round((7 + 9 * progress) * jitter(0.5)) - (random() < 0.3 ? 3 : 0);
    pending = Math.max(60, Math.round(pending + (random() - 0.52) * 18));
    exceptions = Math.max(
      2,
      Math.min(18, exceptions + (random() < 0.5 ? -1 : 1) * (random() < 0.4 ? 1 : 0)),
    );
    const activeContests = 4 + Math.round(Math.sin(index / 18));

    const subscriptionRevenue = Math.round((380_000 + 240_000 * progress) * weekend * jitter(0.15));
    const refunds = Math.round(subscriptionRevenue * (0.015 + random() * 0.02));

    records.push({
      date: day.toISOString(),
      registrations,
      newTrends,
      expiredTrends,
      activeTrends,
      pendingModeration: pending,
      activeContests,
      premiumSubscriptions: premium,
      openExceptions: exceptions,
      subscriptionRevenue,
      refunds,
    });
  }
  return records;
}

export const DASHBOARD_DAILY: readonly DashboardDailyRecord[] = generateDaily();

/** Category weights used to split the open moderation queue. */
export const MODERATION_CATEGORY_WEIGHTS: BreakdownItem[] = [
  { label: "Spam or scams", value: 31 },
  { label: "Harassment or bullying", value: 19 },
  { label: "Nudity or sexual content", value: 12 },
  { label: "Hate speech", value: 9 },
  { label: "Misinformation", value: 8 },
  { label: "Violence or threats", value: 7 },
  { label: "Impersonation", value: 6 },
  { label: "Other", value: 8 },
];

/** Plan and provider weights used to split premium subscriptions. Prices are owner-configured. */
export const SUBSCRIPTION_PLAN_WEIGHTS: BreakdownItem[] = [
  { label: "Monthly · iOS", value: 38 },
  { label: "Monthly · Android", value: 27 },
  { label: "Yearly · iOS", value: 21 },
  { label: "Yearly · Android", value: 14 },
];

export const RECENT_ADMIN_ACTIVITY: ActivityItem[] = [
  {
    id: "act-5108",
    occurredAt: "2026-10-27T21:42:00Z",
    actorName: "Jordan Reyes",
    actorRole: "content_moderator",
    summary: "Removed a reported Trend for spam (case mod-1039)",
    href: "/admin/moderation/mod-1039",
  },
  {
    id: "act-5107",
    occurredAt: "2026-10-27T19:15:00Z",
    actorName: "Marcus Bell",
    actorRole: "finance_admin",
    summary: "Resolved reconciliation exception rec-2201 (amount mismatch)",
    href: "/admin/finance/reconciliation",
  },
  {
    id: "act-5106",
    occurredAt: "2026-10-27T16:03:00Z",
    actorName: "Avery Collins",
    actorRole: "super_admin",
    summary: 'Updated announcement "Scheduled maintenance window"',
    href: "/admin/configuration",
  },
  {
    id: "act-5105",
    occurredAt: "2026-10-27T13:27:00Z",
    actorName: "Priya Natarajan",
    actorRole: "support_agent",
    summary: "Escalated support case sup-3318 to Trust & Safety",
    href: "/admin/support",
  },
  {
    id: "act-5104",
    occurredAt: "2026-10-27T10:51:00Z",
    actorName: "Sofia Laurent",
    actorRole: "contest_admin",
    summary: "Submitted contest ctst-301 for legal review",
    href: "/admin/contests/ctst-301",
  },
  {
    id: "act-5103",
    occurredAt: "2026-10-26T22:08:00Z",
    actorName: "Jordan Reyes",
    actorRole: "content_moderator",
    summary: "Upheld appeal app-0412 after review",
    href: "/admin/appeals",
  },
];

export const PENDING_MODERATION: PendingCase[] = [
  {
    id: "mod-1047",
    category: "Harassment or bullying",
    priority: "critical",
    reportedItem: "Trend trd-8841 comments",
    submittedAt: "2026-10-27T23:12:00Z",
    assignedReviewer: null,
  },
  {
    id: "mod-1046",
    category: "Violence or threats",
    priority: "critical",
    reportedItem: "Direct message thread",
    submittedAt: "2026-10-27T22:40:00Z",
    assignedReviewer: "Jordan Reyes",
  },
  {
    id: "mod-1045",
    category: "Spam or scams",
    priority: "high",
    reportedItem: "Account @deal.drop.daily",
    submittedAt: "2026-10-27T20:05:00Z",
    assignedReviewer: null,
  },
  {
    id: "mod-1044",
    category: "Impersonation",
    priority: "high",
    reportedItem: "Account @riverton.official",
    submittedAt: "2026-10-27T17:31:00Z",
    assignedReviewer: "Jordan Reyes",
  },
  {
    id: "mod-1043",
    category: "Misinformation",
    priority: "medium",
    reportedItem: "Trend trd-8790",
    submittedAt: "2026-10-27T15:18:00Z",
    assignedReviewer: null,
  },
  {
    id: "mod-1042",
    category: "Nudity or sexual content",
    priority: "medium",
    reportedItem: "Profile Post pst-22019",
    submittedAt: "2026-10-27T11:46:00Z",
    assignedReviewer: null,
  },
  {
    id: "mod-1041",
    category: "Other",
    priority: "low",
    reportedItem: "Trend Room room-447",
    submittedAt: "2026-10-26T19:02:00Z",
    assignedReviewer: null,
  },
];

export const FINANCIAL_EXCEPTIONS: FinancialException[] = [
  {
    id: "rec-2207",
    type: "Missing provider record",
    provider: "Google Play",
    amount: 1_299,
    detectedAt: "2026-10-27T18:20:00Z",
    status: "open",
  },
  {
    id: "rec-2206",
    type: "Amount mismatch",
    provider: "App Store",
    amount: 9_999,
    detectedAt: "2026-10-27T09:44:00Z",
    status: "investigating",
  },
  {
    id: "rec-2205",
    type: "Unmatched refund",
    provider: "App Store",
    amount: 1_299,
    detectedAt: "2026-10-26T21:10:00Z",
    status: "open",
  },
  {
    id: "rec-2204",
    type: "Duplicate charge",
    provider: "Google Play",
    amount: 1_299,
    detectedAt: "2026-10-26T08:03:00Z",
    status: "investigating",
  },
];

export const SYSTEM_HEALTH: ServiceHealth[] = [
  { key: "api", name: "Core API", status: "operational", detail: "p95 latency 182 ms" },
  {
    key: "media",
    name: "Media processing queue",
    status: "degraded",
    detail: "Queue age 14 min (target under 5 min)",
  },
  {
    key: "notifications",
    name: "Notification fan-out",
    status: "operational",
    detail: "On schedule",
  },
  {
    key: "ranking",
    name: "TrendScore recalculation",
    status: "operational",
    detail: "Last run 6 min ago",
  },
  {
    key: "payments",
    name: "Payment provider webhooks",
    status: "degraded",
    detail: "3 delayed deliveries in the last hour",
  },
  { key: "search", name: "Search index", status: "operational", detail: "Freshness 2 min" },
];

export const DASHBOARD_ALERTS: DashboardAlert[] = [
  {
    id: "alt-901",
    severity: "critical",
    title: "Critical report awaiting a reviewer",
    description: "Case mod-1047 (harassment) has no assigned reviewer.",
    occurredAt: "2026-10-27T23:14:00Z",
    href: "/admin/moderation/mod-1047",
    permission: "moderation:view",
  },
  {
    id: "alt-902",
    severity: "warning",
    title: "Payment webhook deliveries delayed",
    description: "Reconciliation may lag until deliveries recover.",
    occurredAt: "2026-10-27T22:30:00Z",
    href: "/admin/finance/reconciliation",
    permission: "finance:view",
  },
  {
    id: "alt-903",
    severity: "warning",
    title: "Media processing queue above target",
    description: "Queue age is 14 minutes against a 5 minute target.",
    occurredAt: "2026-10-27T21:05:00Z",
    href: "/admin/operations",
    permission: "operations:view",
  },
  {
    id: "alt-904",
    severity: "warning",
    title: "Copyright notice response due in 24 hours",
    description: "Notice cpy-118 needs a decision before its deadline.",
    occurredAt: "2026-10-27T18:40:00Z",
    href: "/admin/copyright",
    permission: "copyright:view",
  },
  {
    id: "alt-905",
    severity: "info",
    title: "Contest awaiting legal approval",
    description: "Contest ctst-301 cannot be activated until legal review is complete.",
    occurredAt: "2026-10-27T10:55:00Z",
    href: "/admin/contests/ctst-301",
    permission: "contests:view",
  },
  {
    id: "alt-906",
    severity: "info",
    title: "Support case escalated",
    description: "Case sup-3318 was escalated to Trust & Safety.",
    occurredAt: "2026-10-27T13:28:00Z",
    href: "/admin/support",
    permission: "support:view",
  },
  {
    id: "alt-907",
    severity: "info",
    title: "Feature flag change scheduled",
    description: '"Trend Rooms" rollout increases to 50% of a test market.',
    occurredAt: "2026-10-26T16:00:00Z",
    href: "/admin/configuration/feature-flags",
    permission: "configuration:view",
  },
];
