import type { AsyncStatus, ServiceError } from "@/types/api";
import type { AdminRole, Permission } from "@/types/auth";
import type { EntityId, IsoDateString } from "@/types/common";

export type DashboardRange = "7d" | "30d" | "90d";

export const DASHBOARD_RANGE_DAYS: Record<DashboardRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export type KpiKey =
  | "registeredUsers"
  | "newRegistrations"
  | "activeTrends"
  | "pendingModeration"
  | "activeContests"
  | "premiumSubscriptions"
  | "transactionVolume"
  | "financialExceptions";

export interface KpiMetric {
  key: KpiKey;
  label: string;
  value: number;
  /** Same metric at the end of (or summed over) the previous period of equal length. */
  previousValue: number;
  format: "number" | "currency";
  permission: Permission;
  href: string;
  higherIsBetter: boolean;
  helper?: string;
}

/** Long-format point used by every time-series chart. */
export interface SeriesPoint {
  date: IsoDateString;
  series: string;
  value: number;
}

export interface BreakdownItem {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: EntityId;
  occurredAt: IsoDateString;
  actorName: string;
  actorRole: AdminRole;
  summary: string;
  href?: string;
  /** True for events recorded in this browser session by demo actions. */
  session?: boolean;
}

export type CasePriority = "critical" | "high" | "medium" | "low";

export interface PendingCase {
  id: EntityId;
  category: string;
  priority: CasePriority;
  reportedItem: string;
  submittedAt: IsoDateString;
  assignedReviewer: string | null;
}

export interface FinancialException {
  id: EntityId;
  type: "Amount mismatch" | "Missing provider record" | "Duplicate charge" | "Unmatched refund";
  provider: string;
  /** Minor units (cents). */
  amount: number;
  detectedAt: IsoDateString;
  status: "open" | "investigating";
}

export type HealthStatus = "operational" | "degraded" | "down";

export interface ServiceHealth {
  key: string;
  name: string;
  status: HealthStatus;
  detail: string;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  id: EntityId;
  severity: AlertSeverity;
  title: string;
  description: string;
  occurredAt: IsoDateString;
  href: string;
  /** Only roles with this permission see the alert. */
  permission: Permission;
}

export interface DashboardSummary {
  range: DashboardRange;
  asOf: IsoDateString;
  periodStart: IsoDateString;
  kpis: KpiMetric[];
  registrations: SeriesPoint[];
  trendActivity: SeriesPoint[];
  /** Daily for 7 and 30 days, weekly (end-aligned) for 90 days, in minor units. */
  transactions: SeriesPoint[];
  moderationByCategory: BreakdownItem[];
  subscriptionsByPlan: BreakdownItem[];
  recentActivity: ActivityItem[];
  pendingModeration: PendingCase[];
  financialExceptions: FinancialException[];
  systemHealth: ServiceHealth[];
}

export interface DashboardState {
  range: DashboardRange;
  summary: DashboardSummary | null;
  status: AsyncStatus;
  error: ServiceError | null;
  lastLoadedAt: IsoDateString | null;
  /** Id of the newest request; older responses are ignored. */
  latestRequestId: string | null;
}
