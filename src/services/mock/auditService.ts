import type { AuditService } from "@/services/contracts/auditService";
import { mockRequest } from "./mockDelay";

let sequence = 0;

export const mockAuditService: AuditService = {
  record: (draft, actor) =>
    mockRequest(
      () => {
        sequence += 1;
        return {
          ...draft,
          id: `aud-demo-${String(sequence).padStart(4, "0")}`,
          occurredAt: new Date().toISOString(),
          actorId: actor.id,
          actorName: actor.displayName,
          actorRole: actor.role,
          demo: true as const,
        };
      },
      { service: "audit", delayMs: 150 },
    ),
};
