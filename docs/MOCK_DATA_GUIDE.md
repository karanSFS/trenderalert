# Mock Data Guide

> Removed on 2026-10-29 because the screens now use the backend: `moderation.ts`, `appeals.ts`, `trends.ts`, `auditHistory.ts`, `adminDirectory.ts`, the mock feature flags in `configuration.ts`, the ranking proposal in `discovery.ts`, and the dashboard's pending-moderation, admin-activity and system-health samples. `users.ts` stays only as the source of fictional members inside other demo modules.

## Where mock data lives

`src/data/mock/` contains one file per entity type, re-exported from `src/data/mock/index.ts`. Only the mock services in `src/services/mock/` may import it. Components and slices never import mock data; reference lists such as support agents come through services (`useLookup`). Known exceptions to clean up: `DEMO_AS_OF` from `seed.ts` (a constant used for relative dates) and `MODERATION_REVIEWERS` in `useCaseActions` (Phase 5).

| File            | Entity                                                                                              | Phase |
| --------------- | --------------------------------------------------------------------------------------------------- | ----- |
| `adminUsers.ts` | `DemoAdminAccount` (one per admin role)                                                             | 1     |
| `dashboard.ts`  | Daily metric records, breakdown weights, activity, pending cases, exceptions, system health, alerts | 4     |

| `seed.ts` | Shared seeded random generator, `DEMO_AS_OF`, date helpers, fictional name and place pools | 5 |
| `users.ts` | 60 `PlatformUser` records (`usr-1001`…`usr-1060`) | 5 |
| `trends.ts` | 60 `TrendRecord` discovery records (`trd-8790`…`trd-8849`) | 5 |
| `content.ts` | 100 `ContentItem` records (60 Trend posts, 40 Profile Posts `pst-22000`…`pst-22039`) | 5 |
| `moderation.ts` | 119 `ModerationCase` records (`mod-0929`…`mod-1047`) | 5 |
| `appeals.ts` | 15 `Appeal` records (`app-0400`…`app-0414`) | 5 |
| `copyright.ts` | 12 `CopyrightCase` records (`cpy-110`…`cpy-121`) | 5 |
| `auditHistory.ts` | Seeded `AuditEvent` history derived from case outcomes and Trend history, plus Phase 6 operational events | 5, 6 |
| `contests.ts` | 14 `Contest` records (`ctst-288`…`ctst-304`) with generated entries and disputes | 6 |
| `subscriptions.ts` | 26 `Subscription` records (`sub-<user number>`) and 65 ledger `Transaction` records (`txn-50001`…) | 6 |
| `reconciliation.ts` | 11 `ReconciliationRecord` records (`rec-2196`…`rec-2207`) linked to transactions | 6 |
| `supportCases.ts` | 34 `SupportCase` records (`sup-3301`…`sup-3334`), support agents, `maskEmail` | 6 |
| `discovery.ts` | `DiscoveryConfig`: markets, featured locations, sources, freshness, relevance, ranking proposal | 6 |
| `configuration.ts` | `ConfigurationData`: settings, announcements, policy versions, feature flags with gates | 6 |
| `adminDirectory.ts` | 11 `AdminAccount` records (five per-role demo administrators plus colleagues; not used for sign-in) | 6 |
| `operations.ts` | Simulated operations snapshot (objectives, queues, incidents, maintenance) | 6 |

### Relationships (Phase 5)

```mermaid
flowchart LR
  Users --> Content
  Content -->|"same id for Trend posts"| Trends
  Content --> Moderation
  Users --> Moderation
  Moderation --> Appeals
  Content --> Copyright
```

- Every `creatorId`, `accountId`, `contentId` and `caseId` resolves to a seeded record (checked by script).
- Content states are pre-assigned so seeded outcomes match: removed content has a remove case (or a copyright removal); restricted and suspended users have a matching case.
- Open moderation cases equal the dashboard's pending KPI, with the same category split as the dashboard donut.
- Ids referenced by the dashboard and alerts (`mod-1039`, `mod-1041`…`mod-1047`, `trd-8841`, `pst-22019`, `app-0412`, `cpy-118`, `usr-1044`, `usr-1045`) exist with matching values.

### In-memory demo database

`src/services/mock/db.ts` deep-clones every dataset once when the app loads. Mock services read and change only this copy, so a demo action in one module is visible in the others (for example, suspending from a case changes the user). Seeded arrays are never mutated, and a page refresh restores the seed. Report counts on users and content are derived from cases when the database loads.

### Generated series (`dashboard.ts`)

Time series are generated, not hand-written, but remain deterministic:

- `DEMO_AS_OF` (`2026-10-28T00:00:00Z`) is the fixed "today" of the demo. Never use the real clock for mock data.
- `DASHBOARD_DAILY` holds 180 days produced by a fixed-seed generator (mulberry32, seed `20261028`) with gentle growth and weekend seasonality. Changing the seed or formulas changes every dashboard figure, so document such changes in the changelog.
- Breakdowns (moderation categories, subscription plans) are weights that the service splits with largest-remainder rounding, so the parts always add up to the KPI total.
- Record ids in panels (`mod-1047`, `rec-2207`, `ctst-301`, `sup-3318`) are reserved for the matching module datasets in Phases 5 and 6, which must reuse them.

### Operational data (Phase 6)

- Four contests are active (dashboard KPI). `ctst-301` awaits legal review; `ctst-300` is the only contest with every approval recorded; `ctst-302` and `ctst-304` are paid and stay blocked.
- Transactions are generated with subscriptions using illustrative demo prices (`DEMO_PRICE_CENTS`); store prices are configured remotely (D-05). Refunds and chargebacks are separate negative records linked by `relatedTransactionId`.
- `rec-2203` to `rec-2207` are unresolved (5, the dashboard KPI) with the dashboard's types, providers and amounts; `rec-2201` was resolved by Marcus Bell at 2026-10-27 19:15 UTC. When the database loads, transactions linked to unresolved exceptions are marked `exception`.
- `sup-3318` was escalated to Trust & Safety by Priya Natarajan at 13:27 UTC. Contact details are stored pre-masked.
- "Trend Rooms" is on at 50% of a test market; `paid_contests` is off with six outstanding gates.
- Operations values match the dashboard health panel; backlog counts are computed from the demo database.
- The audit service appends every recorded demo event to `db.auditHistory`, so the audit log shows seeded history and session actions together.

## TypeScript types

Every entity has an interface. Shared types live in `src/types/`; domain types in `src/features/<domain>/<domain>Types.ts`. Mock records are typed with those interfaces so a shape change fails type checking.

## Rules

1. Fictional data only. No real people, organizations, emails or locations that imply real activity.
2. Deterministic: fixed ids and fixed ISO timestamps. Never use `Math.random()` or `Date.now()` to build records.
3. Consistent ids with readable prefixes (`adm-001`, later `usr-…`, `trd-…`, `mod-…`) and valid cross-references between files.
4. Enough records to exercise filtering, sorting, pagination and empty states.
5. Never present mock metrics as real platform activity. The UI shows a demo banner and labels demo figures.

## Adding records

1. Add records to the relevant file using the existing interface.
2. Keep ids unique and references valid.
3. If you add a field, update the interface first and fill it for every record.

## How demo operations update state

Mock services change only the in-memory database (`db.ts`) and return deep clones (`structuredClone`), so the seeded arrays are never mutated. Redux reducers then upsert the returned records. A page refresh therefore resets demo changes, which keeps the demo repeatable.
