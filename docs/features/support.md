# Support

### 1. Overview

Support case directory and drawer with assignment, status changes, internal notes and escalation. Member contact details are masked.

### 2. Requirements

Prompt section 13 (support). Specification ADMIN-006 and the Support Agent definition: limited account metadata, no secrets or payment credentials.

### 3. Routes and screens

`/admin/support` (`SupportScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action         | Rule                            | Result                      |
| -------------- | ------------------------------- | --------------------------- |
| Assign to me   | Not resolved; not already yours | Assignee set                |
| Reassign       | Not resolved                    | Assignee changed or cleared |
| Wait on member | Not resolved                    | Waiting on member           |
| Resolve        | Assigned; not resolved          | Resolved                    |
| Reopen         | Not open                        | Open; escalation cleared    |
| Escalate       | Not resolved; team; reason      | Escalated to the team       |
| Add note       | 3 to 1000 characters            | Internal note added         |

### 5. Components

`SupportScreen` (with `SupportDrawer`), shared `FormModal`, `ActionButtons`.

### 6. Redux state

`support` directory slice. Thunks `fetchSupportCases`, `fetchSupportCase`, `assignSupportCase`, `setSupportStatus`, `addSupportNote`, `escalateSupportCase`.

### 7. Data model

`SupportCase`: id, subject, category, priority, status, userId, username, maskedContact, assignee, escalatedTo, createdAt, updatedAt, summary, notes, history.

### 8. Mock data

`data/mock/supportCases.ts`: 34 cases `sup-3301`…`sup-3334`. `sup-3318` was escalated to Trust & Safety by Priya Natarajan on 2026-10-27 (dashboard alert and activity). Agents: Priya Natarajan, Tomas Wexford, Leah Okafor.

### 9. Service layer

`SupportService`: `list`, `get`, `assign`, `setStatus`, `addNote`, `escalate`.

### 10. Loading and error handling

Standard states; menu actions show a toast on failure, dialogs keep the error inline.

### 11. Permissions

View `support:view`, act `support:manage` (Super Administrator, Support Agent).

### 12. Business rules

Contact details are masked (`ar***@members.demo.test`). Cases must be assigned before they are resolved. Resolved cases cannot be escalated or reassigned until reopened.

### 13. Testing

Script: resolving an unassigned case is rejected; escalation without a reason is rejected.

### 14. Files changed

`src/components/support/SupportScreen.tsx`, `src/app/admin/(portal)/support/page.tsx`, `src/features/support/*`, `src/data/mock/supportCases.ts`, `src/services/mock/supportService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/support`, `GET /admin/support/{id}`, `POST .../assignment`, `POST .../status`, `POST .../notes`, `POST .../escalation`. Masking must be enforced by the backend, not the UI.

### 16. Known limitations

No member messaging, attachments or SLA timers.
