import type { AuditService } from "./contracts/auditService";
import type { AuthService } from "./contracts/authService";
import { mockAuditService } from "./mock/auditService";
import { mockAuthService } from "./mock/authService";

/**
 * Service registry. Redux thunks import services from here, never from `mock/` directly,
 * so a backend implementation can be swapped in without touching slices or components.
 */
export const authService: AuthService = mockAuthService;
export const auditService: AuditService = mockAuditService;
