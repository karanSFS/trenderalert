import type { AuditEvent, AuditEventDraft } from "@/features/audit/auditTypes";
import type { DemoAdminAccount } from "@/types/auth";

/**
 * In production the backend writes audit records itself as part of each action; the client
 * would only read them. This contract exists so the demo can show the resulting entries.
 */
export interface AuditService {
  record(draft: AuditEventDraft, actor: DemoAdminAccount): Promise<AuditEvent>;
}
