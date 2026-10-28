import type { Appeal, AppealFilters } from "@/features/appeals/appealsTypes";
import type { AuditEvent } from "@/features/audit/auditTypes";
import type { ContentAction, ContentFilters, ContentItem } from "@/features/content/contentTypes";
import type {
  CopyrightCase,
  CopyrightFilters,
  CopyrightResolution,
  EvidenceStatus,
} from "@/features/copyright/copyrightTypes";
import type {
  ModerationActionType,
  ModerationCase,
  ModerationFilters,
} from "@/features/moderation/moderationTypes";
import type { TrendCorrection, TrendFilters, TrendRecord } from "@/features/trends/trendsTypes";
import type { PlatformUser, UserEnforcementAction, UserFilters } from "@/features/users/usersTypes";
import type { EntityId } from "@/types/common";
import type { ActionActor, DirectoryService } from "./directory";

export interface UserActivity {
  cases: ModerationCase[];
  contentCount: number;
  trendCount: number;
  auditHistory: AuditEvent[];
}

export interface UsersService extends DirectoryService<PlatformUser, UserFilters> {
  getActivity(id: EntityId): Promise<UserActivity>;
  enforce(
    id: EntityId,
    action: UserEnforcementAction,
    reason: string,
    actor: ActionActor,
  ): Promise<PlatformUser>;
}

export interface ContentContext {
  reports: ModerationCase[];
  trend: TrendRecord | null;
  creator: PlatformUser | null;
}

export interface ContentService extends DirectoryService<ContentItem, ContentFilters> {
  getContext(id: EntityId): Promise<ContentContext>;
  moderate(
    id: EntityId,
    action: ContentAction,
    reason: string,
    actor: ActionActor,
  ): Promise<ContentItem>;
}

export interface TrendContext {
  content: ContentItem | null;
  mergedFrom: TrendRecord[];
  /** Active, unmerged Trends this one could be merged into. */
  mergeTargets: { id: EntityId; topic: string }[];
}

export interface TrendsService extends DirectoryService<TrendRecord, TrendFilters> {
  getContext(id: EntityId): Promise<TrendContext>;
  setFeatured(
    id: EntityId,
    featured: boolean,
    reason: string,
    actor: ActionActor,
  ): Promise<TrendRecord>;
  setSuppressed(
    id: EntityId,
    suppressed: boolean,
    reason: string,
    actor: ActionActor,
  ): Promise<TrendRecord>;
  endEarly(id: EntityId, reason: string, actor: ActionActor): Promise<TrendRecord>;
  correct(id: EntityId, correction: TrendCorrection, actor: ActionActor): Promise<TrendRecord>;
  /** Returns the updated source record (now merged into the target). */
  merge(
    sourceId: EntityId,
    targetId: EntityId,
    reason: string,
    actor: ActionActor,
  ): Promise<TrendRecord>;
}

export interface CaseContext {
  content: ContentItem | null;
  account: PlatformUser;
  priorCases: ModerationCase[];
}

export interface ModerationService extends DirectoryService<ModerationCase, ModerationFilters> {
  getContext(id: EntityId): Promise<CaseContext>;
  assign(id: EntityId, reviewer: ActionActor | null, actor: ActionActor): Promise<ModerationCase>;
  addNote(id: EntityId, text: string, actor: ActionActor): Promise<ModerationCase>;
  act(
    id: EntityId,
    action: ModerationActionType,
    reason: string,
    actor: ActionActor,
  ): Promise<ModerationCase>;
}

export interface AppealsService extends DirectoryService<Appeal, AppealFilters> {
  getOriginalCase(id: EntityId): Promise<ModerationCase>;
  decide(
    id: EntityId,
    outcome: "upheld" | "reversed",
    reason: string,
    actor: ActionActor,
  ): Promise<Appeal>;
}

export interface CopyrightService extends DirectoryService<CopyrightCase, CopyrightFilters> {
  setEvidence(id: EntityId, evidence: EvidenceStatus, actor: ActionActor): Promise<CopyrightCase>;
  resolve(
    id: EntityId,
    resolution: CopyrightResolution,
    reason: string,
    actor: ActionActor,
  ): Promise<CopyrightCase>;
}
