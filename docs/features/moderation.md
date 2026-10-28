# Moderation

### 1. Overview

Priority-ordered queue of member reports and a full case page with report details, related content and account, prior cases, reviewer notes, history and a decision bar.

### 2. Requirements

Prompt section 13. Product goal "Safe community" (reports enter a staffed queue). COMM-004 (minimum necessary context). Content Moderator role definition.

### 3. Routes and screens

`/admin/moderation` (`ModerationQueueScreen`), `/admin/moderation/[id]` (`CaseDetailScreen`), note `FormModal`, decision `ConfirmDialog`.

### 4. User interactions

| Action                                                                                 | Rule                                       | Result                            |
| -------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------- |
| Filter priority, status, category, assignee; Open/All toggle; sort priority, submitted | Default: open cases by priority            | Query kept in Redux               |
| Assign to me / Unassign                                                                | Open cases                                 | New cases move to In review       |
| Add note                                                                               | 3-1000 characters                          | Internal note, audit event        |
| Dismiss                                                                                | Open; reason                               | Status Dismissed                  |
| Issue warning                                                                          | Open; reason                               | +1 strike on the account          |
| Remove content / Limit content                                                         | Open; case has content; reason             | Content Removed or Limited        |
| Restrict / Suspend account                                                             | Open; account not pending deletion; reason | Account status changes, +1 strike |
| Escalate                                                                               | Open, not already escalated; reason        | Status Escalated (stays open)     |

### 5. Components

`ModerationQueueScreen`, `CaseDetailScreen`, `useCaseActions`, shared components.

### 6. Redux state

`moderation` slice with context `CaseContext` (content, account, prior cases). Thunks `fetchCases`, `fetchCase`, `fetchCaseContext`, `assignCase`, `addCaseNote`, `actOnCase`.

### 7. Data model

`ModerationCase`: id, category, priority, status, targetType (`content | account | message | room`), contentId, accountId, reportedItemLabel, reporterCount, details, submittedAt, assigned reviewer, notes, history, outcome.

### 8. Mock data

`data/mock/moderation.ts`: 119 cases `mod-0929`…`mod-1047`. The number of open cases equals the dashboard's pending KPI (79) and the open-case categories follow the dashboard donut split. `mod-1041`…`mod-1047` match the dashboard's pending list; `mod-1039` matches its "Removed a reported Trend" activity. Closed outcomes point at content and accounts already in the matching state.

### 9. Service layer

`ModerationService`: `list`, `get`, `getContext`, `assign`, `addNote`, `act`. `act` applies cross-module effects to content and accounts in the shared demo database.

### 10. Loading and error handling

Standard table and record states; decision buttons disabled with tooltips when not allowed; errors keep dialogs open.

### 11. Permissions

View `moderation:view`; assign, notes and decisions `moderation:act` (Super Administrator, Content Moderator).

### 12. Business rules

Reason required for every decision. Closed cases cannot be changed or reassigned. Content actions require a content-linked case. Pending-deletion accounts cannot be restricted or suspended. Notes must not contain sensitive data.

### 13. Testing

Browser: queue loads 79 open cases sorted by priority. Script: suspend from case suspends the user; remove from case removes content; acting on a closed case and short reasons are rejected.

### 14. Files changed

`src/components/moderation/*`, `src/app/admin/(portal)/moderation/**`, `src/features/moderation/*`, `src/data/mock/moderation.ts`, `src/services/mock/moderationService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/moderation/cases`, `GET /admin/moderation/cases/{id}`, `.../context`, `POST .../assign`, `POST .../notes`, `POST .../decision {action, reason}`. Reporter identities must never be exposed to the reported user; access to evidence must be logged.

### 16. Known limitations

No evidence media viewer; dashboard figures do not change after demo decisions; reviewer list is the two demo moderators.
