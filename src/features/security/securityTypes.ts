import type { AuditTargetType } from "@/features/audit/auditTypes";
import type { AdminRole } from "@/types/auth";
import type { EntityId, IsoDateString, TimelineEntry } from "@/types/common";

export type AdminAccountStatus = "active" | "invited" | "deactivated";

/** Named administrator account (ADMIN-001). No credentials are stored or shown. */
export interface AdminAccount {
  id: EntityId;
  displayName: string;
  email: string;
  role: AdminRole;
  status: AdminAccountStatus;
  mfaEnabled: boolean;
  createdAt: IsoDateString;
  lastActiveAt: IsoDateString | null;
  history: TimelineEntry[];
}

export interface AdminAccountFilters {
  role?: AdminRole;
  status?: AdminAccountStatus;
}

export interface AdminInvite {
  displayName: string;
  email: string;
  role: AdminRole;
}

export interface AuditLogFilters {
  actorId?: EntityId;
  module?: string;
  targetType?: AuditTargetType;
  occurred?: [IsoDateString, IsoDateString] | null;
}
