import type { AsyncStatus, ServiceError } from "@/types/api";
import type { AdminRole } from "@/types/auth";
import type { EntityId, IsoDateString } from "@/types/common";

export type AuditTargetType =
  | "user"
  | "content"
  | "trend"
  | "moderationCase"
  | "appeal"
  | "copyrightCase"
  | "contest"
  | "subscription"
  | "transaction"
  | "reconciliation"
  | "supportCase"
  | "discovery"
  | "configuration"
  | "featureFlag"
  | "adminUser"
  | "incident";

/** A simulated administrative action. Never a real audit record. */
export interface AuditEvent {
  id: EntityId;
  occurredAt: IsoDateString;
  actorId: EntityId;
  actorName: string;
  actorRole: AdminRole;
  /** Dotted action name, e.g. "user.suspend" or "trend.feature". */
  action: string;
  targetType: AuditTargetType;
  targetId: EntityId;
  /** Human-readable description shown in audit lists. */
  summary: string;
  reason?: string;
  demo: true;
}

/** What a module supplies; actor, id and time are added when the event is recorded. */
export type AuditEventDraft = Pick<AuditEvent, "action" | "targetType" | "targetId" | "summary"> & {
  reason?: string;
};

export interface AuditState {
  /** Events recorded during this browser session, newest first. */
  sessionEvents: AuditEvent[];
  recordStatus: AsyncStatus;
  recordError: ServiceError | null;
}
