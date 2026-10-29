import type {
  BreakdownItem,
  DashboardAlert,
  FinancialException,
} from "@/features/dashboard/dashboardTypes";
import { DAY_MS, DEMO_AS_OF, seededRandom } from "./seed";

export { DEMO_AS_OF };

/**
 * Fictional dashboard data. Everything is generated from a fixed seed and a fixed reference
 * date so the demo is identical on every run. None of it reflects real platform activity.
 */

export const DASHBOARD_HISTORY_DAYS = 180;

export interface DashboardDailyRecord {
  date: string;
  registrations: number;
  newTrends: number;
  expiredTrends: number;
  activeTrends: number;
  activeContests: number;
  premiumSubscriptions: number;
  openExceptions: number;
  /** Minor units (cents). */
  subscriptionRevenue: number;
  refunds: number;
}

function generateDaily(): DashboardDailyRecord[] {
  const random = seededRandom(20261028);
  const jitter = (spread: number) => 1 + (random() - 0.5) * 2 * spread;
  const end = Date.parse(DEMO_AS_OF);
  const records: DashboardDailyRecord[] = [];

  let activeTrends = 10_400;
  let premium = 8_150;
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

/** Plan and provider weights used to split premium subscriptions. Prices are owner-configured. */
export const SUBSCRIPTION_PLAN_WEIGHTS: BreakdownItem[] = [
  { label: "Monthly · iOS", value: 38 },
  { label: "Monthly · Android", value: 27 },
  { label: "Yearly · iOS", value: 21 },
  { label: "Yearly · Android", value: 14 },
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

export const DASHBOARD_ALERTS: DashboardAlert[] = [
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
    href: "/admin/support?open=sup-3318",
    permission: "support:view",
  },
];
