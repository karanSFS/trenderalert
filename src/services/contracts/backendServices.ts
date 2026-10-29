import type { Appeal, AppealFilters, AppealOutcome } from "@/features/appeals/appealsTypes";
import type {
  ModerationAction,
  ModerationFilters,
  ModerationReport,
} from "@/features/moderation/moderationTypes";
import type {
  FeatureFlag,
  FeatureFlagChange,
  PlatformHealth,
  PlatformMetrics,
} from "@/features/platform/platformTypes";
import type {
  AdminRoleAssignment,
  AdminRoleFilters,
  AssignRoleRequest,
  AuditLogEntry,
  AuditLogFilters,
  SupportLookupRequest,
  SupportLookupResult,
} from "@/features/security/securityTypes";
import type { TrendFilters, TrendInsights, TrendPost } from "@/features/trends/trendsTypes";
import type { DirectoryUser, DirectoryUserFilters } from "@/features/users/usersTypes";
import type { EntityId } from "@/types/common";
import type { DirectoryService } from "./directory";

/** Services backed by the TrenderAlert backend (see `services/api/*`). */

export interface PlatformService {
  getMetrics(): Promise<PlatformMetrics>;
  getHealth(): Promise<PlatformHealth>;
}

export interface ModerationService extends DirectoryService<ModerationReport, ModerationFilters> {
  /** Assigns the report to an administrator, or clears the assignment with `null`. */
  assign(id: EntityId, adminUserId: EntityId | null): Promise<ModerationReport>;
  addNote(id: EntityId, notes: string): Promise<ModerationReport>;
  act(
    id: EntityId,
    action: ModerationAction,
    justification: string,
    notes?: string,
  ): Promise<ModerationReport>;
}

export interface AppealsService extends DirectoryService<Appeal, AppealFilters> {
  resolve(id: EntityId, outcome: AppealOutcome, reason: string): Promise<Appeal>;
}

export interface FeatureFlagsService {
  list(): Promise<FeatureFlag[]>;
  save(change: FeatureFlagChange): Promise<FeatureFlag>;
}

export type AuditLogService = DirectoryService<AuditLogEntry, AuditLogFilters>;

export interface AdminRolesService extends DirectoryService<AdminRoleAssignment, AdminRoleFilters> {
  assign(request: AssignRoleRequest): Promise<AdminRoleAssignment>;
  revoke(userId: EntityId, justification: string): Promise<AdminRoleAssignment>;
}

export type UserDirectoryService = DirectoryService<DirectoryUser, DirectoryUserFilters>;

export interface SupportLookupService {
  lookup(request: SupportLookupRequest): Promise<SupportLookupResult>;
}

export interface TrendsService extends DirectoryService<TrendPost, TrendFilters> {
  /** TrendScore breakdown and cross-city journey for the Trend's topic. */
  getInsights(id: EntityId): Promise<TrendInsights>;
}
