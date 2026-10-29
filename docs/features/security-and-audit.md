# Security and audit

> **Status (2026-10-29):** Admin users and Audit logs now use the backend (`GET /admin/roles`, assign, revoke; `GET /admin/audit-logs`). Invitations and deactivation are not available in the backend. See [BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md); the demo behaviour below is historical.

### 1. Overview

Administrator directory with invitations, role changes and deactivation, and an append-only audit log of demo administrative actions.

### 2. Requirements

Prompt section 13 (admin users, audit logs). Specification ADMIN-001 (named accounts), ADMIN-002 (audited actions), least privilege per role.

### 3. Routes and screens

- `/admin/security/admin-users` (`AdminUsersScreen`) with drawer `?open=<id>`.
- `/admin/security/audit-logs` (`AuditLogScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action                  | Rule                                                               | Result                                     |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| Invite administrator    | Name; unique fictional `@demo.trenderalert.test` email; role       | Invited; no email sent                     |
| Change role             | Not yourself; not deactivated; reason; keep one active Super Admin | Role changed                               |
| Deactivate / reactivate | Not yourself; reason; keep one active Super Admin                  | Status changed                             |
| Filter audit log        | Administrator, module, target type, date range, search             | Filtered list                              |
| Export                  | —                                                                  | Disabled: "Requires backend authorization" |

### 5. Components

`AdminUsersScreen` (with `AdminDrawer`, `MfaBadge`), `AuditLogScreen` (with `AuditEventDrawer`).

### 6. Redux state

`adminUsers` and `auditLog` directory slices. Thunks `fetchAdminUsers`, `fetchAdminUser`, `inviteAdmin`, `changeAdminRole`, `setAdminActive`, `fetchAuditLog`. The `audit` slice still records session events.

### 7. Data model

`AdminAccount`: id, displayName, email, role, status, mfaEnabled, createdAt, lastActiveAt, history. `AuditEvent` (unchanged; target types now include `incident`).

### 8. Mock data

`data/mock/adminDirectory.ts`: five demo administrators (one per role) plus six colleagues (one invited, one deactivated, one without MFA). The audit log reads `db.auditHistory`, which includes seeded history and every demo action recorded this session.

### 9. Service layer

`AdminUsersService`: `list`, `get`, `invite`, `changeRole`, `setActive`. `AuditLogService`: `list`, `get`. `auditService.record` now also appends to `db.auditHistory`.

### 10. Loading and error handling

Standard directory and drawer states.

### 11. Permissions

Admin users `security:manage-admins`; audit log `audit:view` (both Super Administrator only).

### 12. Business rules

Administrators cannot change their own role or status. At least one active Super Admin must remain. MFA status is shown; no credentials or secrets are stored. The audit log cannot be edited or deleted.

### 13. Testing

Script: self role change rejected; deactivating the last Super Admin rejected; invite with a non-demo domain rejected; recorded events appear in the audit log list.

### 14. Files changed

`src/components/security/*`, `src/app/admin/(portal)/security/**`, `src/features/security/*`, `src/data/mock/adminDirectory.ts`, `src/services/mock/adminUsersService.ts`, `src/services/mock/auditLogService.ts`, `src/services/mock/auditService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/admin-users`, `POST /admin/admin-users/invitations`, `PATCH /admin/admin-users/{id}/role`, `PATCH /admin/admin-users/{id}/status`, `GET /admin/audit-log`. Authorization, MFA enforcement and tamper-evident audit storage must be backend-owned.

### 16. Known limitations

Demo role checks are not security. Session audit entries reset on reload.
