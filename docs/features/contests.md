# Contests

### 1. Overview

Contest directory and a full contest page with approval states, eligibility, prize and payout status, official rules, entries, disputes and history. Free contests can move through draft, review and approval in the demo. Paid contests are always blocked.

### 2. Requirements

Prompt section 13 (contests). Specification CONT-001 to CONT-012, owner decisions D-07 (judging method) and D-09 (paid contests and jurisdictions). Paid-contest activation stays disabled.

### 3. Routes and screens

- `/admin/contests` (`ContestsScreen`): directory with search, status and type filters, row actions.
- `/admin/contests/[id]` (`ContestDetailScreen`): full page. Unknown ids show the record-not-found state.

### 4. User interactions

| Action                   | Rule                                                                                             | Result                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Lock rules               | Draft with unlocked rules                                                                        | Rules become read-only                                  |
| Submit for review        | Draft with locked rules                                                                          | In review; outstanding approvals set Pending            |
| Approve for publication  | In review, free contest, rules locked, funding verified, legal and operations approvals Approved | Approved                                                |
| Request changes          | In review; reason                                                                                | Back to draft, rules unlocked                           |
| Cancel contest           | Draft, in review, approved or active; reason                                                     | Cancelled; payout not applicable                        |
| Disqualify / clear entry | Active or judging; reason                                                                        | Entry status changes; score cleared on disqualification |
| Resolve dispute          | Open dispute; written resolution                                                                 | Dispute resolved                                        |

Active contests show a notice that terms cannot change mid-contest; cancellation under the official rules is the only path.

### 5. Components

`ContestsScreen`, `ContestDetailScreen`, `useContestActions` (shared action items and `contestActionBlock`), shared `ActionButtons`, `SectionCard`, `RecordState`, `Timeline`.

### 6. Redux state

`contests` directory slice. Thunks `fetchContests`, `fetchContest`, `lockContestRules`, `submitContestForReview`, `decideContest`, `setContestEntryStatus`, `resolveContestDispute`.

### 7. Data model

`Contest`: id, name, type (free or paid), status, sponsor, entry window, eligibility, prize, `fundingStatus`, `approvals` (legal, paymentProvider, operations), `rules` (version, locked, judgingMethod), `payoutStatus`, `entries[]`, `disputes[]`, `history[]`.

### 8. Mock data

`data/mock/contests.ts`: 14 fictional contests. Four are active (matching the dashboard KPI). `ctst-301` awaits legal review (dashboard alert and activity). `ctst-300` is the only contest that can be approved. `ctst-302` and `ctst-304` are paid and stay blocked.

### 9. Service layer

`ContestsService`: `list`, `get`, `lockRules`, `submitForReview`, `decide`, `setEntryStatus`, `resolveDispute`.

### 10. Loading and error handling

Directory and record states from the shared components. Blocked actions are disabled with the rule in a tooltip, and the service rejects them again if called.

### 11. Permissions

View `contests:view` (Super Administrator, Contest Administrator, Finance Administrator). Act `contests:manage` (Super Administrator, Contest Administrator).

### 12. Business rules

Approval states are read-only: they are recorded by legal, payment-provider and operations teams in the backend. Paid contests cannot be approved. Approval needs locked rules and verified funding. Reasons are required for decisions, entry changes and dispute resolutions.

### 13. Testing

Script: approving a paid contest is rejected; approving `ctst-301` is rejected while legal is pending; approving `ctst-300` succeeds; cancelling a completed contest is rejected.

### 14. Files changed

`src/components/contests/*`, `src/app/admin/(portal)/contests/**`, `src/features/contests/*`, `src/data/mock/contests.ts`, `src/services/mock/contestsService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/contests`, `GET /admin/contests/{id}`, `POST .../rules/lock`, `POST .../submit`, `POST .../decision {decision, reason}`, `POST .../entries/{entryId}/status`, `POST .../disputes/{disputeId}/resolution`. Approval records, winner verification and payouts must be backend-owned.

### 16. Known limitations

No contest creation or editing form, no media for entries and no payout execution.
