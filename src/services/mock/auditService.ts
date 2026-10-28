import type { AuditEvent } from "@/features/audit/auditTypes";
import type { AuditService } from "@/services/contracts/auditService";
import { db } from "./db";
import { mockRequest } from "./mockDelay";

let sequence = 0;

export const mockAuditService: AuditService = {
  /** Appends only: recorded events are never edited or removed. */
  record: (draft, actor) =>
    mockRequest(
      () => {
        sequence += 1;
        const event: AuditEvent = {
          ...draft,
          id: `aud-demo-${String(sequence).padStart(4, "0")}`,
          occurredAt: new Date().toISOString(),
          actorId: actor.id,
          actorName: actor.displayName,
          actorRole: actor.role,
          demo: true,
        };
        db.auditHistory.unshift(event);
        return event;
      },
      { service: "audit", delayMs: 150 },
    ),
};
