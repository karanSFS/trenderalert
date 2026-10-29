import { createSelector } from "@reduxjs/toolkit";
import { selectCurrentRole } from "@/features/auth/authSelectors";
import { roleHasPermission } from "@/lib/constants/roles";
import type { RootState } from "@/store";

export const selectDashboard = (state: RootState) => state.dashboard;
export const selectDashboardRange = (state: RootState) => state.dashboard.range;
export const selectDashboardSummary = (state: RootState) => state.dashboard.summary;

/** KPIs the current demo role may see. */
export const selectVisibleKpis = createSelector(
  [selectDashboardSummary, selectCurrentRole],
  (summary, role) =>
    summary && role ? summary.kpis.filter((kpi) => roleHasPermission(role, kpi.permission)) : [],
);
