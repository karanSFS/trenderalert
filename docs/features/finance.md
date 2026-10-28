# Finance

### 1. Overview

Finance overview, an append-only transaction ledger with a simulated refund request, and reconciliation of internal records against store references with investigation and resolution.

### 2. Requirements

Prompt section 13 (finance, transactions, reconciliation). Specification: Finance Administrator reconciles transactions, refunds and payouts with no moderation authority. No real financial operations.

### 3. Routes and screens

- `/admin/finance` (`FinanceOverviewScreen`): totals for 7, 30 or 90 days, charges by store, links, and a notice that contest payouts are not connected.
- `/admin/finance/transactions` (`TransactionsScreen`) with drawer `?open=<id>`.
- `/admin/finance/reconciliation` (`ReconciliationScreen`) with drawer `?open=<id>`.

### 4. User interactions

| Action                     | Rule                                                        | Result                                                                      |
| -------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Request refund (simulated) | Settled purchase or renewal without a linked refund; reason | New pending refund record linked to the original; original amount unchanged |
| Start investigation        | Open exception                                              | Investigating; history entry                                                |
| Resolve                    | Not resolved; resolution type and note                      | Resolved; resolution and history appended; linked transaction Matched       |

### 5. Components

`FinanceOverviewScreen`, `TransactionsScreen` (with `TransactionDrawer`), `ReconciliationScreen` (with `ReconciliationDrawer`), `TransactionList`, `MetricCard`.

### 6. Redux state

`transactions` and `reconciliation` directory slices; `financeOverview` document slice. Thunks `fetchTransactions`, `fetchTransaction`, `fetchTransactionContext`, `requestRefund`, `fetchReconciliation`, `fetchReconciliationRecord`, `investigateException`, `resolveException`, `fetchFinanceOverview`.

### 7. Data model

`Transaction` (amount in cents, negative for refunds and chargebacks; `relatedTransactionId`, `refundedBy`, `reconciliation` state). `ReconciliationRecord` (exceptionType, status, transactionId, providerReference, internal and provider amounts, resolution, history). `FinanceOverview`.

### 8. Mock data

Transactions are generated with subscriptions. `data/mock/reconciliation.ts` holds 11 records. `rec-2203` to `rec-2207` are unresolved (5, matching the dashboard KPI); `rec-2201` was resolved by Marcus Bell on 2026-10-27 (dashboard activity).

### 9. Service layer

`TransactionsService`: `list`, `get`, `getContext`, `getOverview`, `requestRefund`. `ReconciliationService`: `list`, `get`, `getContext`, `investigate`, `resolve`.

### 10. Loading and error handling

Standard directory, drawer and dialog states; the overview shows skeleton cards and an error state with retry.

### 11. Permissions

View `finance:view` (Super Administrator, Finance Administrator). Act `finance:manage` (same roles).

### 12. Business rules

The ledger is append-only: a refund is a new record and never edits the original amount. Resolving an exception appends to its history and does not overwrite earlier entries. No money moves; refunds are completed by the stores.

### 13. Testing

Script: refund creates a new negative pending record and sets `refundedBy`; a second refund is rejected; resolving an exception appends history and is rejected the second time.

### 14. Files changed

`src/components/finance/*`, `src/app/admin/(portal)/finance/**`, `src/features/finance/*`, `src/data/mock/reconciliation.ts`, `src/data/mock/subscriptions.ts`, `src/services/mock/transactionsService.ts`, `src/services/mock/reconciliationService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/finance/overview?periodDays`, `GET /admin/finance/transactions`, `POST /admin/finance/transactions/{id}/refund-requests {reason}`, `GET /admin/finance/reconciliation`, `POST .../{id}/investigation`, `POST .../{id}/resolution {type, note}`. Requires provider integrations and backend authorization.

### 16. Known limitations

No exports, payout execution, fee accounting or multi-currency support.
