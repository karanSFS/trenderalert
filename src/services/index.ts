import type { AuditService } from "./contracts/auditService";
import type { AuthService } from "./contracts/authService";
import type { DashboardService } from "./contracts/dashboardService";
import { mockAuditService } from "./mock/auditService";
import { mockAuthService } from "./mock/authService";
import { mockDashboardService } from "./mock/dashboardService";

/**
 * Service registry. Redux thunks import services from here, never from `mock/` directly,
 * so a backend implementation can be swapped in without touching slices or components.
 */
export const authService: AuthService = mockAuthService;
export const auditService: AuditService = mockAuditService;
export const dashboardService: DashboardService = mockDashboardService;
