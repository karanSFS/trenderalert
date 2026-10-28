# Subscriptions

### 1. Overview

Read-only directory of a sample of Premium subscriptions with store, renewal and entitlement status, plus a drawer with linked transactions and store events.

### 2. Requirements

Prompt section 13 (subscriptions). Specification D-05: prices are configured in the App Store and Google Play; subscription state is owned by the stores.

### 3. Routes and screens

`/admin/subscriptions` (`SubscriptionsScreen`) with drawer `?open=<id>`.

### 4. User interactions

Search, filter by status, plan and store, and open the drawer. There are no mutations: cancellations, refunds and renewals happen in the stores.

### 5. Components

`SubscriptionsScreen` (with `SubscriptionDrawer`), `TransactionList`.

### 6. Redux state

`subscriptions` directory slice with context `Transaction[]`. Thunks `fetchSubscriptions`, `fetchSubscription`, `fetchSubscriptionTransactions`.

### 7. Data model

`Subscription`: id, userId, username, plan, store, storeReference (opaque), status, autoRenew, startedAt, currentPeriodEnd, entitlement, history.

### 8. Mock data

`data/mock/subscriptions.ts` generates 26 subscriptions from the member sample (active, grace period, billing retry, cancelled, expired, refunded, revoked) and their ledger. Demo prices are illustrative.

### 9. Service layer

`SubscriptionsService`: `list`, `get`, `getTransactions`.

### 10. Loading and error handling

Standard directory and drawer states.

### 11. Permissions

`subscriptions:view` (Super Administrator, Support Agent, Finance Administrator).

### 12. Business rules

No payment credentials are stored or shown. Entitlement is derived from the store status.

### 13. Testing

Open a billing-retry subscription and confirm the failed renewal appears in its transactions.

### 14. Files changed

`src/components/finance/SubscriptionsScreen.tsx`, `src/components/finance/TransactionList.tsx`, `src/app/admin/(portal)/subscriptions/page.tsx`, `src/features/subscriptions/*`, `src/data/mock/subscriptions.ts`, `src/services/mock/subscriptionsService.ts`.

### 15. Backend integration requirements

Proposed: `GET /admin/subscriptions`, `GET /admin/subscriptions/{id}`, `GET /admin/subscriptions/{id}/transactions`. State should come from store server notifications.

### 16. Known limitations

The list is a sample, not the platform total shown on the dashboard.
