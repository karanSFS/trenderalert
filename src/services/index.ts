import { apiAuthService } from "./api/authService";
import { apiAppealsService, apiModerationService } from "./api/moderationApi";
import {
  apiAdminRolesService,
  apiAuditLogService,
  apiFeatureFlagsService,
  apiPlatformService,
  apiSupportLookupService,
} from "./api/platformApi";
import { apiTrendsService } from "./api/trendsApi";
import { apiUserDirectoryService } from "./api/usersApi";
import type { AuditService } from "./contracts/auditService";
import type { AuthService } from "./contracts/authService";
import type {
  AdminRolesService,
  AppealsService,
  AuditLogService,
  FeatureFlagsService,
  ModerationService,
  PlatformService,
  SupportLookupService,
  TrendsService,
  UserDirectoryService,
} from "./contracts/backendServices";
import type { DashboardService } from "./contracts/dashboardService";
import type { ContentService, CopyrightService } from "./contracts/moduleServices";
import type {
  ConfigurationService,
  ContestsService,
  DiscoveryService,
  OperationsService,
  ReconciliationService,
  SubscriptionsService,
  SupportService,
  TransactionsService,
} from "./contracts/operationalServices";
import { mockAuditService } from "./mock/auditService";
import { mockConfigurationService } from "./mock/configurationService";
import { mockContentService } from "./mock/contentService";
import { mockContestsService } from "./mock/contestsService";
import { mockCopyrightService } from "./mock/copyrightService";
import { mockDashboardService } from "./mock/dashboardService";
import { mockDiscoveryService } from "./mock/discoveryService";
import { mockOperationsService } from "./mock/operationsService";
import { mockReconciliationService } from "./mock/reconciliationService";
import { mockSubscriptionsService } from "./mock/subscriptionsService";
import { mockSupportService } from "./mock/supportService";
import { mockTransactionsService } from "./mock/transactionsService";

/**
 * Service registry. Redux thunks import services from here, never from `api/` or `mock/`
 * directly, so each mock can be replaced by a backend implementation without touching slices
 * or components.
 */

// Connected to the TrenderAlert backend.
export const authService: AuthService = apiAuthService;
export const platformService: PlatformService = apiPlatformService;
export const moderationService: ModerationService = apiModerationService;
export const appealsService: AppealsService = apiAppealsService;
export const featureFlagsService: FeatureFlagsService = apiFeatureFlagsService;
export const auditLogService: AuditLogService = apiAuditLogService;
export const adminRolesService: AdminRolesService = apiAdminRolesService;
export const supportLookupService: SupportLookupService = apiSupportLookupService;
export const trendsService: TrendsService = apiTrendsService;
export const usersService: UserDirectoryService = apiUserDirectoryService;

// Demo data until backend endpoints exist.
export const auditService: AuditService = mockAuditService;
export const dashboardService: DashboardService = mockDashboardService;
export const contentService: ContentService = mockContentService;
export const copyrightService: CopyrightService = mockCopyrightService;
export const contestsService: ContestsService = mockContestsService;
export const subscriptionsService: SubscriptionsService = mockSubscriptionsService;
export const transactionsService: TransactionsService = mockTransactionsService;
export const reconciliationService: ReconciliationService = mockReconciliationService;
export const supportService: SupportService = mockSupportService;
export const discoveryService: DiscoveryService = mockDiscoveryService;
export const configurationService: ConfigurationService = mockConfigurationService;
export const operationsService: OperationsService = mockOperationsService;
