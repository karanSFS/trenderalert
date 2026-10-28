import type { AuditEvent } from "@/features/audit/auditTypes";
import { auditLogService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { AuditLogFilters } from "./securityTypes";

/** Read-only: the audit log has no mutations. */
export const auditLogModule = createDirectorySlice<AuditEvent, AuditLogFilters>({
  name: "auditLog",
  service: auditLogService,
  initialFilters: { actorId: undefined, module: undefined, targetType: undefined, occurred: null },
  list: { sortField: "occurredAt", sortOrder: "descend", pageSize: 20 },
});

export const auditLogActions = auditLogModule.actions;
export const { fetchList: fetchAuditLog } = auditLogModule;
export default auditLogModule.reducer;
