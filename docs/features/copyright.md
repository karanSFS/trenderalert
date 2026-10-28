# Copyright

### 1. Overview

Directory of takedown notices and counter-notices with affected content, status, deadlines, evidence status and resolution history, plus simulated evidence and resolution actions.

### 2. Requirements

Prompt section 13 (copyright). Specification "Opportunity" and "Creator Ownership Center" rely on origin credit; removal cascades (SHR14-005).

### 3. Routes and screens

`/admin/copyright` (`CopyrightScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action                                                      | Rule                                      | Result                                               |
| ----------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Mark evidence verified / incomplete                         | Open case                                 | Evidence status; received cases move to Under review |
| Remove affected content                                     | Takedown; evidence verified; reason       | Content Removed; status Content removed              |
| Restore content                                             | Counter-notice; evidence verified; reason | Content Visible; status Content restored             |
| Reject notice                                               | Open; reason                              | Status Notice rejected                               |
| Deadlines within 48 hours of the demo date are highlighted. |

### 5. Components

`CopyrightScreen` (with `CopyrightDrawer` and `useCopyrightActions`), shared components.

### 6. Redux state

`copyright` slice (no context). Thunks `fetchCopyrightCases`, `fetchCopyrightCase`, `setCopyrightEvidence`, `resolveCopyright`.

### 7. Data model

`CopyrightCase`: id, noticeType, claimant (fictional), workDescription, contentId, accountId, username, status, evidenceStatus, receivedAt, responseDueAt, history.

### 8. Mock data

`data/mock/copyright.ts`: 12 cases `cpy-110`…`cpy-121`. `cpy-118` is under review with a response due 2026-10-28 18:40 UTC (dashboard alert). Two removed cases point at content pre-marked as removed.

### 9. Service layer

`CopyrightService`: `list`, `get`, `setEvidence`, `resolve`.

### 10. Loading and error handling

Standard states; invalid resolutions disabled with reasons.

### 11. Permissions

View `copyright:view`, act `copyright:manage` (Super Administrator, Content Moderator).

### 12. Business rules

Content can only be removed after evidence is verified, and only for takedown notices; restoration only for verified counter-notices. Reason required for resolutions.

### 13. Testing

Script: removal before verification rejected; verify then remove succeeds and removes the content.

### 14. Files changed

`src/components/copyright/CopyrightScreen.tsx`, `src/app/admin/(portal)/copyright/page.tsx`, `src/features/copyright/*`, `src/data/mock/copyright.ts`, `src/services/mock/copyrightService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/copyright`, `GET /admin/copyright/{id}`, `POST .../evidence {status}`, `POST .../resolution {resolution, reason}`. Statutory notice handling, deadlines and notifications require legal review before production.

### 16. Known limitations

No document uploads or claimant correspondence. Deadlines are demo values, not legal guidance.
