# Moderation

### 1. Overview

Live trust and safety queue from the TrenderAlert backend, and a report page where moderators assign reports, add internal notes and take enforcement actions.

### 2. Requirements

Prompt section 13. Product goal "Safe community" (reports enter a staffed queue). Content Moderator role definition. Backend Module 11 (Admin Mission Control).

### 3. Routes and screens

- `/admin/moderation` (`ModerationQueueScreen`): queue with status, category and priority filters and server paging.
- `/admin/moderation/[id]` (`ReportDetailScreen`): report page. Unknown ids show the record-not-found state.

### 4. User interactions

| Action                                       | Rule                     | Backend                                                                    |
| -------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| Filter by status, category, priority (P1–P5) | —                        | `GET /admin/moderation/queue?status_filter&category&priority&limit&offset` |
| Assign to me / Unassign me                   | Open or in-review report | `POST …/{id}/assign {admin_user_id}`                                       |
| Add note                                     | 3+ characters            | `POST …/{id}/notes {notes}`                                                |
| Dismiss report                               | Open or in review        | `POST …/{id}/action {action_name, justification, moderator_notes}`         |
| Warn, Restrict features, Suspend, Ban        | Report names an account  | same                                                                       |
| Suppress content                             | Report names a Trend     | same                                                                       |

Every action needs a justification of at least 10 characters (the backend enforces this too). Resolved reports (Action taken, Dismissed) are read-only.

### 5. Components

`ModerationQueueScreen` (exports `ReportTarget`, `SlaDeadline`), `ReportDetailScreen`, `ModerationActionModal`; shared `DataTable`, `FilterBar`, `ActionButtons`, `FormModal`.

### 6. Redux state

`moderation` directory slice. Thunks `fetchReports`, `fetchReport`, `assignReport`, `addReportNote`, `actOnReport`. The dashboard uses `openReports` (open + in-review list).

### 7. Data model

`ModerationReport`: id, targetTrendId, targetUserId, category, priority (1–5), assignedAdminId/Name/Email, slaDueAt, moderatorNotes, status (`OPEN`, `IN_REVIEW`, `ACTION_TAKEN`, `DISMISSED`), createdAt, resolvedAt.

### 8. Mock data

None. The previous mock cases were removed.

### 9. Service layer

`ModerationService` in `services/contracts/backendServices.ts`, implemented by `services/api/moderationApi.ts`.

### 10. Loading and error handling

Table skeleton, inline retry on failure, record-not-found page. Action errors stay in the dialog. If the backend does not clear an assignment, the portal shows an error instead of success.

### 11. Permissions

View `moderation:view`, act `moderation:act` (Super Administrator, Content Moderator). The backend returns 403 for other roles.

### 12. Business rules

SLA breaches are highlighted. Priorities are labelled by SLA (1, 4, 12, 24, 48 hours, from `/admin/meta/values`). Actions that need a target are disabled when the report has none.

### 13. Testing

Verified against the backend: filters, paging, single report, assign, note, dismiss, validation error for a short justification. See `BACKEND_INTEGRATION.md`.

### 14. Files changed

`src/components/moderation/*`, `src/features/moderation/*`, `src/services/api/moderationApi.ts`, `src/lib/constants/moderationLabels.ts`, `src/app/admin/(portal)/moderation/**`.

### 15. Backend integration requirements

Reported: unassign with `null` has no effect; actions are accepted on resolved reports. Useful additions: reporter details and report history.

### 16. Known limitations

Reported items show as ids (the backend sends no Trend or account summary). No search by text.
