import type { AdminRole } from "@/types/auth";
import type { EntityId, IsoDateString } from "@/types/common";

/** `GET /admin/roles`. */
export interface AdminRoleAssignment {
  id: EntityId;
  userId: EntityId;
  userName: string | null;
  userEmail: string | null;
  assignedByEmail: string | null;
  /** Null when the backend sends a role this portal does not know. */
  role: AdminRole | null;
  roleName: string;
  mfaEnabled: boolean;
  isActive: boolean;
  lastReauthAt: IsoDateString | null;
  createdAt: IsoDateString;
}

export interface AdminRoleFilters {
  role?: AdminRole;
  state?: "active" | "inactive";
}

export interface AssignRoleRequest {
  userId: EntityId;
  role: AdminRole;
  mfaEnabled: boolean;
}

/** `GET /admin/audit-logs`. Append-only; the backend has no filters yet. */
export interface AuditLogEntry {
  id: EntityId;
  actorId: EntityId;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  targetId: string;
  targetEmail: string | null;
  justification: string;
  details: Record<string, unknown> | null;
  createdAt: IsoDateString;
}

export type AuditLogFilters = Record<string, never>;

/** `POST /admin/support/user-lookup`. */
export interface SupportLookupRequest {
  searchQuery: string;
  ticketReference: string;
}

export interface SupportLookupResult {
  userId: EntityId;
  emailMasked: string;
  phoneMasked: string | null;
  accountStatus: string;
  isMinor: boolean;
  ageVerifyStatus: string;
  trenderScore: number;
  createdAt: IsoDateString;
  activeSessions: number;
}
