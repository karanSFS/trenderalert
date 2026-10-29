import { auditLogService } from "@/services";
import { createDirectorySlice } from "@/store/createDirectorySlice";
import type { AuditLogEntry, AuditLogFilters } from "./securityTypes";

/** Read-only and append-only; the backend returns newest entries first. */
export const auditLogModule = createDirectorySlice<AuditLogEntry, AuditLogFilters>({
  name: "auditLog",
  service: auditLogService,
  initialFilters: {},
  list: { pageSize: 20 },
});

export const auditLogActions = auditLogModule.actions;
export const { fetchList: fetchAuditLog } = auditLogModule;
export default auditLogModule.reducer;
