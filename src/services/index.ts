import { apiAuthService } from "./api/authService";
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
import type {
  AdminUsersService,
  AuditLogService,
  ConfigurationService,
  ContestsService,
  DiscoveryService,
  OperationsService,
  ReconciliationService,
  SubscriptionsService,
  SupportService,
  TransactionsService,
} from "./contracts/operationalServices";
import { mockAdminUsersService } from "./mock/adminUsersService";
import { mockAppealsService } from "./mock/appealsService";
import { mockAuditLogService } from "./mock/auditLogService";
import { mockAuditService } from "./mock/auditService";
import { mockConfigurationService } from "./mock/configurationService";
import { mockContentService } from "./mock/contentService";
import { mockContestsService } from "./mock/contestsService";
import { mockCopyrightService } from "./mock/copyrightService";
import { mockDashboardService } from "./mock/dashboardService";
import { mockDiscoveryService } from "./mock/discoveryService";
import { mockModerationService } from "./mock/moderationService";
import { mockOperationsService } from "./mock/operationsService";
import { mockReconciliationService } from "./mock/reconciliationService";
import { mockSubscriptionsService } from "./mock/subscriptionsService";
import { mockSupportService } from "./mock/supportService";
import { mockTransactionsService } from "./mock/transactionsService";
import { mockTrendsService } from "./mock/trendsService";
import { mockUsersService } from "./mock/usersService";

/**
 * Service registry. Redux thunks import services from here, never from `mock/` directly,
 * so a backend implementation can be swapped in without touching slices or components.
 */
export const authService: AuthService = apiAuthService;
export const auditService: AuditService = mockAuditService;
export const dashboardService: DashboardService = mockDashboardService;
export const usersService: UsersService = mockUsersService;
export const contentService: ContentService = mockContentService;
export const trendsService: TrendsService = mockTrendsService;
export const moderationService: ModerationService = mockModerationService;
export const appealsService: AppealsService = mockAppealsService;
export const copyrightService: CopyrightService = mockCopyrightService;
export const contestsService: ContestsService = mockContestsService;
export const subscriptionsService: SubscriptionsService = mockSubscriptionsService;
export const transactionsService: TransactionsService = mockTransactionsService;
export const reconciliationService: ReconciliationService = mockReconciliationService;
export const supportService: SupportService = mockSupportService;
export const discoveryService: DiscoveryService = mockDiscoveryService;
export const configurationService: ConfigurationService = mockConfigurationService;
export const adminUsersService: AdminUsersService = mockAdminUsersService;
export const auditLogService: AuditLogService = mockAuditLogService;
export const operationsService: OperationsService = mockOperationsService;
