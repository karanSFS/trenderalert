import type { AuditEvent } from "@/features/audit/auditTypes";
import type {
  Announcement,
  ConfigurationData,
  PlatformSettings,
} from "@/features/configuration/configurationTypes";
import type { Contest, ContestDecision, ContestFilters } from "@/features/contests/contestsTypes";
import type {
  DiscoveryConfig,
  MarketStatus,
  RankingFactor,
} from "@/features/discovery/discoveryTypes";
import type {
  FinanceOverview,
  ReconciliationFilters,
  ReconciliationRecord,
  ResolutionType,
  Transaction,
  TransactionFilters,
} from "@/features/finance/financeTypes";
import type { GeoScope } from "@/features/trends/trendsTypes";
import type { OperationsSnapshot } from "@/features/operations/operationsTypes";
import type {
  AdminAccount,
  AdminAccountFilters,
  AdminInvite,
  AuditLogFilters,
} from "@/features/security/securityTypes";
import type {
  Subscription,
  SubscriptionFilters,
} from "@/features/subscriptions/subscriptionsTypes";
import type {
  EscalationTeam,
  SupportCase,
  SupportFilters,
  SupportStatus,
} from "@/features/support/supportTypes";
import type { AdminRole } from "@/types/auth";
import type { EntityId } from "@/types/common";
import type { ActionActor, DirectoryService } from "./directory";

/** Proposed endpoints live under `/admin/{module}`; none of these are final. */

export interface ContestsService extends DirectoryService<Contest, ContestFilters> {
  lockRules(id: EntityId, actor: ActionActor): Promise<Contest>;
  submitForReview(id: EntityId, actor: ActionActor): Promise<Contest>;
  decide(
    id: EntityId,
    decision: ContestDecision,
    reason: string,
    actor: ActionActor,
  ): Promise<Contest>;
  setEntryStatus(
    id: EntityId,
    entryId: EntityId,
    status: "valid" | "disqualified",
    reason: string,
    actor: ActionActor,
  ): Promise<Contest>;
  resolveDispute(
    id: EntityId,
    disputeId: EntityId,
    resolution: string,
    actor: ActionActor,
  ): Promise<Contest>;
}

export interface SubscriptionsService extends DirectoryService<Subscription, SubscriptionFilters> {
  getTransactions(id: EntityId): Promise<Transaction[]>;
}

export interface TransactionContext {
  related: Transaction[];
  subscription: Subscription | null;
  reconciliation: ReconciliationRecord[];
}

export interface TransactionsService extends DirectoryService<Transaction, TransactionFilters> {
  getContext(id: EntityId): Promise<TransactionContext>;
  getOverview(periodDays: number): Promise<FinanceOverview>;
  /** Records a simulated refund request as a new, linked transaction. Returns the original. */
  requestRefund(id: EntityId, reason: string, actor: ActionActor): Promise<Transaction>;
}

export interface ReconciliationService extends DirectoryService<
  ReconciliationRecord,
  ReconciliationFilters
> {
  getContext(id: EntityId): Promise<Transaction | null>;
  investigate(id: EntityId, actor: ActionActor): Promise<ReconciliationRecord>;
  resolve(
    id: EntityId,
    type: ResolutionType,
    note: string,
    actor: ActionActor,
  ): Promise<ReconciliationRecord>;
}

export interface SupportService extends DirectoryService<SupportCase, SupportFilters> {
  /** Administrators who can be assigned support cases. */
  listAgents(): Promise<ActionActor[]>;
  assign(id: EntityId, agent: ActionActor | null, actor: ActionActor): Promise<SupportCase>;
  setStatus(
    id: EntityId,
    status: Exclude<SupportStatus, "escalated">,
    actor: ActionActor,
  ): Promise<SupportCase>;
  addNote(id: EntityId, text: string, actor: ActionActor): Promise<SupportCase>;
  escalate(
    id: EntityId,
    team: EscalationTeam,
    reason: string,
    actor: ActionActor,
  ): Promise<SupportCase>;
}

export type DiscoveryUpdate =
  | { type: "market"; id: EntityId; status: MarketStatus }
  | { type: "location"; id: EntityId; active: boolean }
  | { type: "source"; id: EntityId; enabled: boolean }
  | { type: "relevance"; scope: GeoScope; radiusKm: number }
  | { type: "ranking"; factors: RankingFactor[]; risingThreshold: number; hotThreshold: number };

export interface DiscoveryService {
  get(): Promise<DiscoveryConfig>;
  update(update: DiscoveryUpdate, actor: ActionActor): Promise<DiscoveryConfig>;
}

export type EditableSettings = Pick<
  PlatformSettings,
  "trendDurationsDays" | "maxSavedFolders" | "reportRateLimitPerHour" | "adminSessionTimeoutMinutes"
>;

export type AnnouncementDraft = Omit<Announcement, "id" | "status" | "updatedBy"> & {
  id?: EntityId;
};

export interface ConfigurationService {
  get(): Promise<ConfigurationData>;
  updateSettings(settings: EditableSettings, actor: ActionActor): Promise<ConfigurationData>;
  saveAnnouncement(draft: AnnouncementDraft, actor: ActionActor): Promise<ConfigurationData>;
  endAnnouncement(id: EntityId, actor: ActionActor): Promise<ConfigurationData>;
  updateFlag(
    key: string,
    change: { enabled: boolean; rollout: number },
    reason: string,
    actor: ActionActor,
  ): Promise<ConfigurationData>;
}

export interface AdminUsersService extends DirectoryService<AdminAccount, AdminAccountFilters> {
  invite(invite: AdminInvite, actor: ActionActor): Promise<AdminAccount>;
  changeRole(
    id: EntityId,
    role: AdminRole,
    reason: string,
    actor: ActionActor,
  ): Promise<AdminAccount>;
  setActive(
    id: EntityId,
    active: boolean,
    reason: string,
    actor: ActionActor,
  ): Promise<AdminAccount>;
}

export interface AuditLogService extends DirectoryService<AuditEvent, AuditLogFilters> {
  /** Administrators for the actor filter. */
  listActors(): Promise<ActionActor[]>;
}

export interface OperationsService {
  getSnapshot(): Promise<OperationsSnapshot>;
  acknowledgeIncident(id: EntityId, actor: ActionActor): Promise<OperationsSnapshot>;
}
