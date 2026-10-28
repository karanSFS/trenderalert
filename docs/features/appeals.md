# Appeals

### 1. Overview

Directory of member appeals against enforcement decisions, with a drawer showing the original decision, the member's reason, evidence and decision history, and simulated uphold or reverse decisions.

### 2. Requirements

Prompt section 13 (appeals). Specification trust measure "successful appeals"; GRP-005 (removal with optional appeal).

### 3. Routes and screens

`/admin/appeals` (`AppealsScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action                                                   | Rule                         | Result                                                       |
| -------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------ |
| Filter status, original decision; search; sort submitted | —                            | Query kept in Redux                                          |
| Uphold decision                                          | Pending or in review; reason | Status Upheld; history entry                                 |
| Reverse decision                                         | Pending or in review; reason | Status Reversed; original enforcement undone; strike removed |

### 5. Components

`AppealsScreen` (with `AppealDrawer` and `useAppealDecision`), shared components.

### 6. Redux state

`appeals` slice with context = original `ModerationCase`. Thunks `fetchAppeals`, `fetchAppeal`, `fetchAppealCase`, `decideAppeal`.

### 7. Data model

`Appeal`: id, caseId, userId, username, originalDecision, appealReason, evidence, status, assignedReviewerName, submittedAt, history, decision.

### 8. Mock data

`data/mock/appeals.ts`: 15 appeals `app-0400`…`app-0414` referencing closed enforcement cases. `app-0412` is upheld on Oct 26 (dashboard activity). Seeded reversals reference warnings only, so seeded account and content states stay consistent.

### 9. Service layer

`AppealsService`: `list`, `get`, `getOriginalCase`, `decide`. Reversal restores content or account access in the shared demo database and adds a history entry to the original case.

### 10. Loading and error handling

Standard states; decided appeals disable both actions with a tooltip.

### 11. Permissions

View `appeals:view`, decide `appeals:decide` (Super Administrator, Content Moderator).

### 12. Business rules

Each appeal can be decided once. Reason required and shared with the member. Reversal never restores an account pending deletion.

### 13. Testing

Script: reversing an appeal for removed content restores it; deciding twice is rejected.

### 14. Files changed

`src/components/appeals/AppealsScreen.tsx`, `src/app/admin/(portal)/appeals/page.tsx`, `src/features/appeals/*`, `src/data/mock/appeals.ts`, `src/services/mock/appealsService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/appeals`, `GET /admin/appeals/{id}`, `POST /admin/appeals/{id}/decision {outcome, reason}`. Ideally decided by a reviewer other than the original decision maker (owner policy decision).

### 16. Known limitations

No reviewer separation enforced in the demo. Evidence is text only.
