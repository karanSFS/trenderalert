# Mock Data Guide

## Where mock data lives

`src/data/mock/` contains one file per entity type, re-exported from `src/data/mock/index.ts`. Only the mock services in `src/services/mock/` may import it. Components and slices never import mock data.

| File            | Entity                                  | Phase |
| --------------- | --------------------------------------- | ----- |
| `adminUsers.ts` | `DemoAdminAccount` (one per admin role) | 1     |

Planned files (users, content, trends, moderation, appeals, contests, subscriptions, transactions, reconciliation, support cases, discovery, feature flags, audit logs, dashboard) are added with their modules.

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

Mock services return deep clones (`structuredClone`), so the source arrays are never mutated. Demo mutations update Redux state through reducers. A page refresh therefore resets demo changes, which keeps the demo repeatable.
