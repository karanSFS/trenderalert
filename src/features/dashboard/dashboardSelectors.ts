import { createSelector } from "@reduxjs/toolkit";
import { selectCurrentRole } from "@/features/auth/authSelectors";
import { selectSessionAuditEvents } from "@/features/audit/auditSelectors";
import { roleHasPermission } from "@/lib/constants/roles";
import type { RootState } from "@/store";
import type { ActivityItem } from "./dashboardTypes";

export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardRange = (state: RootState) => state.dashboard.range;
export const selectDashboardSummary = (state: RootState) => state.dashboard.summary;

/** KPIs the current demo role may see. */
export const selectVisibleKpis = createSelector(
  [selectDashboardSummary, selectCurrentRole],
  (summary, role) =>
    summary && role ? summary.kpis.filter((kpi) => roleHasPermission(role, kpi.permission)) : [],
);

/** Demo audit events from this session first, then the mock history. */
export const selectRecentActivity = createSelector(
  [selectDashboardSummary, selectSessionAuditEvents],
  (summary, sessionEvents): ActivityItem[] => [
    ...sessionEvents.map((event) => ({
      id: event.id,
      occurredAt: event.occurredAt,
      actorName: event.actorName,
      actorRole: event.actorRole,
      summary: event.summary,
      session: true,
    })),
    ...(summary?.recentActivity ?? []),
  ],
);
