import {
  BASE_REGISTERED_USERS,
  DASHBOARD_ALERTS,
  DASHBOARD_DAILY,
  DEMO_AS_OF,
  FINANCIAL_EXCEPTIONS,
  MODERATION_CATEGORY_WEIGHTS,
  PENDING_MODERATION,
  RECENT_ADMIN_ACTIVITY,
  SUBSCRIPTION_PLAN_WEIGHTS,
  SYSTEM_HEALTH,
  type DashboardDailyRecord,
} from "@/data/mock";
import {
  DASHBOARD_RANGE_DAYS,
  type DashboardRange,
  type DashboardSummary,
  type KpiMetric,
  type SeriesPoint,
} from "@/features/dashboard/dashboardTypes";
import type { DashboardService } from "@/services/contracts/dashboardService";
import { splitByWeights } from "@/data/mock/seed";
import { mockRequest } from "./mockDelay";

type NumericField = Exclude<keyof DashboardDailyRecord, "date">;

const sum = (records: readonly DashboardDailyRecord[], field: NumericField) =>
  records.reduce((total, record) => total + record[field], 0);

const last = (records: readonly DashboardDailyRecord[], field: NumericField) =>
  records.length ? records[records.length - 1][field] : 0;

/** Buckets are aligned to the end of the range, so only the oldest bucket can be partial. */
function bucketTransactions(
  records: readonly DashboardDailyRecord[],
  bucketDays: number,
): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  const firstBucketSize = records.length % bucketDays || bucketDays;
  for (let start = 0; start < records.length; start += start === 0 ? firstBucketSize : bucketDays) {
    const bucket = records.slice(start, start + (start === 0 ? firstBucketSize : bucketDays));
    const date = bucket[0].date;
    points.push({ date, series: "Subscriptions", value: sum(bucket, "subscriptionRevenue") });
    points.push({ date, series: "Refunds", value: sum(bucket, "refunds") });
  }
  return points;
}

function buildSummary(range: DashboardRange): DashboardSummary {
  const days = DASHBOARD_RANGE_DAYS[range];
  const current = DASHBOARD_DAILY.slice(-days);
  const previous = DASHBOARD_DAILY.slice(-days * 2, -days);
  const totalUsersNow = BASE_REGISTERED_USERS + sum(DASHBOARD_DAILY, "registrations");
  const newRegistrations = sum(current, "registrations");

  const kpis: KpiMetric[] = [
    {
      key: "registeredUsers",
      label: "Registered users",
      value: totalUsersNow,
      previousValue: totalUsersNow - newRegistrations,
      format: "number",
      permission: "users:view",
      href: "/admin/users",
      higherIsBetter: true,
    },
    {
      key: "newRegistrations",
      label: "New registrations",
      value: newRegistrations,
      previousValue: sum(previous, "registrations"),
      format: "number",
      permission: "users:view",
      href: "/admin/users",
      higherIsBetter: true,
    },
    {
      key: "activeTrends",
      label: "Active Trends",
      value: last(current, "activeTrends"),
      previousValue: last(previous, "activeTrends"),
      format: "number",
      permission: "trends:view",
      href: "/admin/trends",
      higherIsBetter: true,
    },
    {
      key: "pendingModeration",
      label: "Pending moderation cases",
      value: last(current, "pendingModeration"),
      previousValue: last(previous, "pendingModeration"),
      format: "number",
      permission: "moderation:view",
      href: "/admin/moderation",
      higherIsBetter: false,
    },
    {
      key: "activeContests",
      label: "Active contests",
      value: last(current, "activeContests"),
      previousValue: last(previous, "activeContests"),
      format: "number",
      permission: "contests:view",
      href: "/admin/contests",
      higherIsBetter: true,
      helper: "Free contests only",
    },
    {
      key: "premiumSubscriptions",
      label: "Premium subscriptions",
      value: last(current, "premiumSubscriptions"),
      previousValue: last(previous, "premiumSubscriptions"),
      format: "number",
      permission: "subscriptions:view",
      href: "/admin/subscriptions",
      higherIsBetter: true,
    },
    {
      key: "transactionVolume",
      label: "Transaction volume",
      value: sum(current, "subscriptionRevenue"),
      previousValue: sum(previous, "subscriptionRevenue"),
      format: "currency",
      permission: "finance:view",
      href: "/admin/finance/transactions",
      higherIsBetter: true,
      helper: "Gross, simulated",
    },
    {
      key: "financialExceptions",
      label: "Unresolved financial exceptions",
      value: last(current, "openExceptions"),
      previousValue: last(previous, "openExceptions"),
      format: "number",
      permission: "finance:view",
      href: "/admin/finance/reconciliation",
      higherIsBetter: false,
    },
  ];

  return {
    range,
    asOf: DEMO_AS_OF,
    periodStart: current[0].date,
    kpis,
    registrations: current.map((record) => ({
      date: record.date,
      series: "Registrations",
      value: record.registrations,
    })),
    trendActivity: current.map((record) => ({
      date: record.date,
      series: "Active Trends",
      value: record.activeTrends,
    })),
    transactions: bucketTransactions(current, days <= 30 ? 1 : 7),
    moderationByCategory: splitByWeights(
      last(current, "pendingModeration"),
      MODERATION_CATEGORY_WEIGHTS,
    ),
    subscriptionsByPlan: splitByWeights(
      last(current, "premiumSubscriptions"),
      SUBSCRIPTION_PLAN_WEIGHTS,
    ),
    recentActivity: RECENT_ADMIN_ACTIVITY,
    pendingModeration: PENDING_MODERATION,
    financialExceptions: FINANCIAL_EXCEPTIONS,
    systemHealth: SYSTEM_HEALTH,
  };
}

export const mockDashboardService: DashboardService = {
  getSummary: (range) => mockRequest(() => buildSummary(range), { service: "dashboard" }),
  getAlerts: () => mockRequest(() => DASHBOARD_ALERTS, { service: "notifications" }),
};
