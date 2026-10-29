import type {
  FeatureFlag,
  PlatformHealth,
  PlatformMetrics,
} from "@/features/platform/platformTypes";
import type {
  AdminRoleAssignment,
  AuditLogEntry,
  SupportLookupResult,
} from "@/features/security/securityTypes";
import { BACKEND_ROLE_TO_ADMIN_ROLE, ADMIN_ROLE_TO_BACKEND_ROLE } from "@/lib/constants/roles";
import type {
  AdminRolesService,
  AuditLogService,
  FeatureFlagsService,
  PlatformService,
  SupportLookupService,
} from "@/services/contracts/backendServices";
import {
  ApiServiceError,
  apiRequest,
  listItems,
  pageQuery,
  paginateLocally,
  toPaginated,
  utc,
} from "./http";

interface RawMetrics {
  total_users: number;
  open_reports_count: number;
  high_priority_sla_breaches: number;
  active_appeals_count: number;
  active_kill_switches: string[];
  system_health_status?: string;
}

interface RawHealth {
  status: string;
  service?: string;
  version?: string;
  active_trends?: number;
  redis_connected?: boolean;
}

interface RawFlag {
  config_key: string;
  is_enabled: boolean;
  config_payload: Record<string, unknown> | null;
  allowed_regions: string[] | null;
  updated_by: string | null;
  updated_at: string;
}

interface RawRole {
  id: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  assigned_by_email?: string | null;
  role_name: string;
  mfa_enabled: boolean;
  is_active: boolean;
  last_reauth_at: string | null;
  created_at: string;
}

interface RawAudit {
  id: string;
  actor_id: string;
  actor_name?: string | null;
  actor_email?: string | null;
  action_name: string;
  target_entity_id: string;
  target_email?: string | null;
  justification: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface RawLookup {
  user_id: string;
  email_masked: string;
  phone_masked: string | null;
  account_status: string;
  is_minor: boolean;
  age_verify_status: string;
  trender_score: number;
  created_at: string;
  active_sessions_count: number;
}

const FLAGS = "/api/v1/admin/configs/feature-flags";
const ROLES = "/api/v1/admin/roles";

const mapFlag = (raw: RawFlag): FeatureFlag => ({
  key: raw.config_key,
  enabled: raw.is_enabled,
  payload: raw.config_payload ?? {},
  regions: raw.allowed_regions ?? [],
  updatedBy: raw.updated_by,
  updatedAt: utc(raw.updated_at) ?? raw.updated_at,
});

const mapRole = (raw: RawRole): AdminRoleAssignment => ({
  id: raw.id,
  userId: raw.user_id,
  userName: raw.user_name ?? null,
  userEmail: raw.user_email ?? null,
  assignedByEmail: raw.assigned_by_email ?? null,
  role: BACKEND_ROLE_TO_ADMIN_ROLE[raw.role_name] ?? null,
  roleName: raw.role_name,
  mfaEnabled: raw.mfa_enabled,
  isActive: raw.is_active,
  lastReauthAt: utc(raw.last_reauth_at),
  createdAt: utc(raw.created_at) ?? raw.created_at,
});

const mapAudit = (raw: RawAudit): AuditLogEntry => ({
  id: raw.id,
  actorId: raw.actor_id,
  actorName: raw.actor_name ?? null,
  actorEmail: raw.actor_email ?? null,
  action: raw.action_name,
  targetId: raw.target_entity_id,
  targetEmail: raw.target_email ?? null,
  justification: raw.justification,
  details: raw.details,
  createdAt: utc(raw.created_at) ?? raw.created_at,
});

export const apiPlatformService: PlatformService = {
  getMetrics: async () => {
    const raw = await apiRequest<RawMetrics>("/api/v1/admin/dashboard/metrics");
    return {
      totalUsers: raw.total_users,
      openReports: raw.open_reports_count,
      slaBreaches: raw.high_priority_sla_breaches,
      activeAppeals: raw.active_appeals_count,
      activeKillSwitches: raw.active_kill_switches ?? [],
      systemHealth: raw.system_health_status ?? "UNKNOWN",
    } satisfies PlatformMetrics;
  },

  getHealth: async () => {
    const raw = await apiRequest<RawHealth>("/health");
    return {
      status: raw.status,
      service: raw.service ?? "TrenderAlert API",
      version: raw.version ?? "—",
      activeTrends: raw.active_trends ?? null,
      redisConnected: raw.redis_connected ?? null,
    } satisfies PlatformHealth;
  },
};

export const apiFeatureFlagsService: FeatureFlagsService = {
  list: async () =>
    listItems<RawFlag>(await apiRequest<unknown>(FLAGS))
      .map(mapFlag)
      .sort((a, b) => a.key.localeCompare(b.key)),

  save: async (change) =>
    mapFlag(
      await apiRequest<RawFlag>(FLAGS, {
        method: "POST",
        body: {
          config_key: change.key,
          is_enabled: change.enabled,
          config_payload: change.payload,
          allowed_regions: change.regions,
          justification: change.justification,
        },
      }),
    ),
};

export const apiAuditLogService: AuditLogService = {
  list: async (query) =>
    toPaginated<RawAudit, AuditLogEntry>(
      await apiRequest<unknown>("/api/v1/admin/audit-logs", {
        query: pageQuery(query.page, query.pageSize),
      }),
      query.page,
      query.pageSize,
      mapAudit,
    ),

  /** No single-entry endpoint yet, so the newest entries are searched. */
  get: async (id) => {
    for (let offset = 0; offset < 1000; offset += 100) {
      const page = listItems<RawAudit>(
        await apiRequest<unknown>("/api/v1/admin/audit-logs", { query: { limit: 100, offset } }),
      );
      const match = page.find((item) => item.id === id);
      if (match) return mapAudit(match);
      if (page.length < 100) break;
    }
    throw new ApiServiceError("NOT_FOUND", `Audit entry ${id} was not found.`);
  },
};

async function listRoles() {
  return listItems<RawRole>(await apiRequest<unknown>(ROLES))
    .map(mapRole)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const apiAdminRolesService: AdminRolesService = {
  /** The roles endpoint returns every assignment, so filtering and paging happen here. */
  list: async (query) => {
    const { role, state } = query.filters ?? {};
    const search = query.search?.trim().toLowerCase() ?? "";
    const items = (await listRoles()).filter(
      (item) =>
        (!role || item.role === role) &&
        (!state || (state === "active") === item.isActive) &&
        (!search ||
          [item.userId, item.userName, item.userEmail].some((field) =>
            field?.toLowerCase().includes(search),
          )),
    );
    return paginateLocally(items, query.page, query.pageSize);
  },

  get: async (id) => {
    const match = (await listRoles()).find((item) => item.id === id);
    if (!match) throw new ApiServiceError("NOT_FOUND", `Role assignment ${id} was not found.`);
    return match;
  },

  assign: async ({ userId, role, mfaEnabled }) =>
    mapRole(
      await apiRequest<RawRole>(`${ROLES}/assign`, {
        method: "POST",
        body: {
          user_id: userId,
          role_name: ADMIN_ROLE_TO_BACKEND_ROLE[role],
          mfa_enabled: mfaEnabled,
        },
      }),
    ),

  revoke: async (userId, justification) =>
    mapRole(
      await apiRequest<RawRole>(`${ROLES}/${encodeURIComponent(userId)}/revoke`, {
        method: "POST",
        body: { justification },
      }),
    ),
};

export const apiSupportLookupService: SupportLookupService = {
  lookup: async ({ searchQuery, ticketReference }) => {
    const raw = await apiRequest<RawLookup>("/api/v1/admin/support/user-lookup", {
      method: "POST",
      body: { search_query: searchQuery, ticket_reference: ticketReference },
    });
    return {
      userId: raw.user_id,
      emailMasked: raw.email_masked,
      phoneMasked: raw.phone_masked,
      accountStatus: raw.account_status,
      isMinor: raw.is_minor,
      ageVerifyStatus: raw.age_verify_status,
      trenderScore: raw.trender_score,
      createdAt: utc(raw.created_at) ?? raw.created_at,
      activeSessions: raw.active_sessions_count,
    } satisfies SupportLookupResult;
  },
};
