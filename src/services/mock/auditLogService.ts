import type { AuditLogService } from "@/services/contracts/operationalServices";
import { db, findOrThrow } from "./db";
import { mockRequest } from "./mockDelay";
import { applyListQuery } from "./query";

const SERVICE = "audit";

/** Read-only, append-only view over seeded history plus this session's demo events. */
export const mockAuditLogService: AuditLogService = {
  list: (query) =>
    mockRequest(
      () =>
        applyListQuery(db.auditHistory, query, {
          searchFields: (item) => [
            item.id,
            item.summary,
            item.actorName,
            item.targetId,
            item.action,
            item.reason,
          ],
          filterPredicates: {
            actorId: (item, value) => item.actorId === value,
            module: (item, value) => item.action.split(".")[0] === value,
            targetType: (item, value) => item.targetType === value,
            occurred: (item, [from, to]) => item.occurredAt >= from && item.occurredAt <= to,
          },
          sortAccessors: {
            occurredAt: (item) => item.occurredAt,
          },
        }),
      { service: SERVICE },
    ),

  get: (id) =>
    mockRequest(() => findOrThrow(db.auditHistory, id, "Audit event"), { service: SERVICE }),

  listActors: () =>
    mockRequest(() => db.adminUsers.map((item) => ({ id: item.id, name: item.displayName })), {
      service: SERVICE,
      delayMs: 0,
    }),
};
