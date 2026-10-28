import type {
  DashboardAlert,
  DashboardRange,
  DashboardSummary,
} from "@/features/dashboard/dashboardTypes";

export interface DashboardService {
  /** KPIs, charts and operational panels for the selected range. */
  getSummary(range: DashboardRange): Promise<DashboardSummary>;
  /** Operational alerts shown in the header bell. The UI filters them by permission. */
  getAlerts(): Promise<DashboardAlert[]>;
}
