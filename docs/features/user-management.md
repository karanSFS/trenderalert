# User Management

### 1. Overview

Directory and detail page for member accounts: search, filters, status, subscription, verification, safety indicators, moderation and audit history, and simulated enforcement (restrict, suspend, reinstate). Deletion status is shown read-only.

### 2. Requirements

Prompt section 11. Specification D-10 (30-day deletion grace), PROF-003 (admin corrections are audited), Support Agent role limits ("limited account metadata"). Approximate location only (D-03).

### 3. Routes and screens

- `/admin/users`: directory (`UsersScreen`).
- `/admin/users/[id]`: detail page (`UserDetailScreen`).
- Dialog: `ConfirmDialog` for each enforcement action.

### 4. User interactions

| Action                                                                                 | Where                     | Rule                                     | Result                                    |
| -------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- | ----------------------------------------- |
| Search                                                                                 | Directory                 | Username, name, email, id                | Debounced; page resets to 1               |
| Filter                                                                                 | Directory                 | Status, subscription, verification       | Kept in Redux across navigation           |
| Sort                                                                                   | Directory                 | Member, reports, registered              | Server-style sort                         |
| View                                                                                   | Row click or row action   | —                                        | Opens detail page                         |
| Restrict                                                                               | Row action, detail header | Active only; reason required             | Status Restricted, +1 strike, audit event |
| Suspend                                                                                | Row action, detail header | Not already suspended; reason required   | Status Suspended, +1 strike, audit event  |
| Reinstate                                                                              | Row action, detail header | Restricted or suspended; reason required | Status Active, audit event                |
| View content                                                                           | Detail page               | `content:view`                           | Opens Content filtered by creator         |
| Accounts pending deletion are read-only; every action is disabled with an explanation. |

### 5. Components

`UsersScreen`, `UserDetailScreen`, `useUserActions` (specs, eligibility, row actions), shared `DataTable`, `FilterBar`, `RowActions`, `useConfirm`, `SectionCard`, `DetailList`, `Timeline`, `EntityLink`, `RecordState`, `StatusBadge`.

### 6. Redux state

`users` slice from `createDirectorySlice`: `list` (query, ids, total, status, error, requestId), `entities`, `detail`, `context` (`UserActivity`), `mutation`. Thunks: `fetchUsers`, `fetchUser`, `fetchUserActivity`, `enforceUser`. Selectors: `usersSelectors` in `features/moduleSelectors.ts`. Session audit events come from `makeSelectAuditEventsForTarget`.

### 7. Data model

`PlatformUser` (`features/users/usersTypes.ts`): id, username, displayName, email (fictional `.test`), registeredAt, approximateLocation, status (`active | restricted | suspended | pending_deletion`), subscription (plan, store, renewsAt), verification, followers, trendsPublished, reportsReceived, strikes, lastEnforcement, deletion.

### 8. Mock data

`data/mock/users.ts`: 60 accounts `usr-1001`…`usr-1060`, seed 1001. Fixed statuses: 5 restricted, 3 suspended, 3 pending deletion (so moderation outcomes match). `usr-1044` is `@riverton.official`, `usr-1045` is `@deal.drop.daily` (dashboard references). `reportsReceived` is derived from moderation cases when the demo database loads.

### 9. Service layer

`UsersService`: `list`, `get`, `getActivity` (cases about the user, content and Trend counts, audit history), `enforce(id, action, reason, actor)`.

### 10. Loading and error handling

Table skeleton on first load, overlay on refetch, error with retry, empty state. Detail page uses `RecordState` (skeleton, "Record not found", error with retry). Dialog errors keep the dialog open.

### 11. Permissions

View: `users:view` (Super Administrator, Content Moderator, Support Agent). Enforcement: `users:manage` (Super Administrator only). Moderators restrict or suspend through moderation cases.

### 12. Business rules

Reason of at least 10 characters for every enforcement action. Pending-deletion accounts cannot be changed (D-10). Strikes remain after reinstatement. Location shown as an approximate area only.

### 13. Testing

Verified: directory, filters, sort, pagination; restrict with reason validation and success toast; row updates; detail page with history and audit entry. Service rules verified by script (restrict pending-deletion rejected; reinstate restricted). See `TESTING.md`.

### 14. Files changed

`src/components/users/*`, `src/app/admin/(portal)/users/**`, `src/features/users/*`, `src/data/mock/users.ts`, `src/services/mock/usersService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/users`, `GET /admin/users/{id}`, `GET /admin/users/{id}/activity`, `POST /admin/users/{id}/enforcement {action, reason}`. Server-side authorization, audit records and member notification are required. Fields returned must respect the caller's role (Support Agents receive limited metadata).

### 16. Known limitations

The directory is a 60-account sample, not the platform total. Demo changes reset on refresh. No bulk actions. Deletion cannot be cancelled by admins by design.
