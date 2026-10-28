import type { AuditService } from "./contracts/auditService";
import type { AuthService } from "./contracts/authService";
import type { DashboardService } from "./contracts/dashboardService";
import type {
  AppealsService,
  ContentService,
  CopyrightService,
  ModerationService,
  TrendsService,
  UsersService,
} from "./contracts/moduleServices";
import { mockAppealsService } from "./mock/appealsService";
import { mockAuditService } from "./mock/auditService";
import { mockAuthService } from "./mock/authService";
import { mockContentService } from "./mock/contentService";
import { mockCopyrightService } from "./mock/copyrightService";
import { mockDashboardService } from "./mock/dashboardService";
import { mockModerationService } from "./mock/moderationService";
import { mockTrendsService } from "./mock/trendsService";
import { mockUsersService } from "./mock/usersService";

/**
 * Service registry. Redux thunks import services from here, never from `mock/` directly,
 * so a backend implementation can be swapped in without touching slices or components.
 */
export const authService: AuthService = mockAuthService;
export const auditService: AuditService = mockAuditService;
export const dashboardService: DashboardService = mockDashboardService;
export const usersService: UsersService = mockUsersService;
export const contentService: ContentService = mockContentService;
export const trendsService: TrendsService = mockTrendsService;
export const moderationService: ModerationService = mockModerationService;
export const appealsService: AppealsService = mockAppealsService;
export const copyrightService: CopyrightService = mockCopyrightService;
