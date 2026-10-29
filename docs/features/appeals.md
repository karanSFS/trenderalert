# Appeals

### 1. Overview

Member appeals against enforcement decisions, from the TrenderAlert backend, with a drawer to read the statement and evidence and to uphold or overturn the decision.

### 2. Requirements

Prompt section 13 (appeals). Backend Module 11.

### 3. Routes and screens

`/admin/appeals` (`AppealsScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action             | Rule                                                    | Backend                                                        |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------- |
| Filter by status   | `SUBMITTED`, `IN_REVIEW`, `UPHELD`, `OVERTURNED`        | `GET /admin/appeals?status_filter&limit&offset`                |
| Open appeal        | —                                                       | `GET /admin/appeals/{id}`                                      |
| Uphold or overturn | Submitted or in review; written reason (10+ characters) | `POST /admin/appeals/{id}/resolve {status, resolution_reason}` |

### 5. Components

`AppealsScreen` (with `AppealDrawer`), shared `DataTable`, `DetailDrawer`, `useConfirm`.

### 6. Redux state

`appeals` directory slice. Thunks `fetchAppeals`, `fetchAppeal`, `resolveAppeal`.

### 7. Data model

`Appeal`: id, reportId, appellantUserId/Name/Email, statement, evidenceAssets, assignedAdminId, status, resolutionReason, submittedAt, resolvedAt.

### 8. Mock data

None. The previous mock appeals were removed.

### 9. Service layer

`AppealsService` (`backendServices.ts`), implemented in `services/api/moderationApi.ts`.

### 10. Loading and error handling

Standard table and drawer states. The empty state explains that appeals appear when members challenge a decision.

### 11. Permissions

View `appeals:view`, decide `appeals:decide` (Super Administrator, Content Moderator).

### 12. Business rules

Resolved appeals are read-only. The appellant's email is masked in the list.

### 13. Testing

The backend currently has no appeals, so resolve could not be exercised end to end; listing, filters and the empty state were verified.

### 14. Files changed

`src/components/appeals/AppealsScreen.tsx`, `src/features/appeals/*`, `src/services/api/moderationApi.ts`.

### 15. Backend integration requirements

None outstanding.

### 16. Known limitations

No way to mark an appeal "in review" from the portal.
