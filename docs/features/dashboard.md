# Admin Dashboard and Notification Bell

> **Status (2026-10-29):** The dashboard now opens with a live section from the backend (metrics, health, open reports, report categories, recent audit activity). The KPIs, charts and panels below it remain labelled demo data. See [BACKEND_INTEGRATION.md](../BACKEND_INTEGRATION.md).

### 1. Overview

`/admin/dashboard` shows platform status at a glance: KPI cards, charts and operational panels for the selected period. The header bell lists operational alerts. Every figure is fictional demo data, labeled as such, and filtered by the current demo role.

### 2. Requirements

Prompt section 10 (KPIs, charts, operational panels, date-range filtering, refresh, navigation to related records, loading, error and empty states). Prompt section 4 (notification indicator in the header). Specification goals "Safe community" and "Reliable monetization" inform the moderation and reconciliation panels. Paid contests are activation-gated, so contest payout volume is zero.

### 3. Routes and screens

- `/admin/dashboard` (`src/app/admin/(portal)/dashboard/page.tsx` renders `DashboardScreen`).
- Header bell popover on every admin page.

### 4. User interactions

| Interaction                     | Outcome                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Range switcher (7, 30, 90 days) | Refetches the summary; KPIs compare with the previous period of the same length; the range is kept in Redux across navigation |
| Refresh                         | Refetches through the mock service; current content stays visible while the button shows loading                              |
| KPI card click                  | Opens the related admin page                                                                                                  |
| Panel row click                 | Opens the related record (for example `/admin/moderation/mod-1047`)                                                           |
| "View all" links                | Open the related directory                                                                                                    |
| Bell click                      | Opens the alerts popover                                                                                                      |
| Alert click                     | Marks it read, closes the popover and opens the linked page                                                                   |
| Mark all as read                | Clears the unread count for the alerts the role can see                                                                       |

### 5. Components

- `components/dashboard/DashboardScreen.tsx`: page composition and chart definitions.
- `components/dashboard/MetricCard.tsx`, `ChartCard.tsx` (Phase 3).
- `components/dashboard/charts/`: `DashboardCharts.tsx` (Line, Column and Pie from `@ant-design/charts`) and `index.tsx` (lazy, `ssr: false` wrappers).
- `components/dashboard/panels/`: `Panel.tsx` (card shell and row primitives), `OperationalPanels.tsx` (five panels), `statusTones.ts` (badge mappings).
- `components/layout/NotificationBell.tsx`.

### 6. Redux state

- `dashboard` slice: `range`, `summary`, `status`, `error`, `lastLoadedAt`, `latestRequestId`. Thunk `fetchDashboard(range)`; responses from superseded requests are ignored. Reducer `setDashboardRange`.
- Selectors (`dashboardSelectors.ts`): `selectDashboard`, `selectDashboardRange`, `selectDashboardSummary`, `selectVisibleKpis` (role-filtered), `selectRecentActivity` (session demo audit events first, then mock history).
- `notifications` slice: `items`, `status`, `error`, `readIds`. Thunk `fetchNotifications` (skipped while loading). Reducers `markNotificationRead`, `markNotificationsRead`. Selectors `selectVisibleNotifications` (role-filtered, newest first), `selectUnreadNotificationCount`.

### 7. Data model

`src/features/dashboard/dashboardTypes.ts`: `DashboardRange`, `DashboardSummary`, `KpiMetric`, `SeriesPoint`, `BreakdownItem`, `ActivityItem`, `PendingCase`, `FinancialException`, `ServiceHealth`, `DashboardAlert`. Each `KpiMetric` and `DashboardAlert` carries the `Permission` needed to see it.

### 8. Mock data

`src/data/mock/dashboard.ts`:

- `DEMO_AS_OF = 2026-10-28T00:00:00Z` and 180 days of `DASHBOARD_DAILY` records produced by a fixed-seed generator (mulberry32) with growth and weekend seasonality.
- Category and plan weights for the donuts (split with largest-remainder rounding so parts sum to the KPI).
- Static lists: `RECENT_ADMIN_ACTIVITY`, `PENDING_MODERATION`, `FINANCIAL_EXCEPTIONS`, `SYSTEM_HEALTH`, `DASHBOARD_ALERTS`. Ids match future module routes (`mod-…`, `rec-…`, `ctst-301`).

### 9. Service layer

`DashboardService` (`services/contracts/dashboardService.ts`), mock in `services/mock/dashboardService.ts`:

- `getSummary(range)`: slices the last N days, compares with the N days before, buckets transactions (daily for 7 and 30 days, weekly for 90 days, aligned to the end of the range). Service key `dashboard`.
- `getAlerts()`: returns all alerts; the UI filters by permission. Service key `notifications`.

### 10. Loading and error handling

- First load: skeletons in KPI cards, chart cards and panels (shown after 150ms).
- Refresh or range change: existing content stays; the Refresh button shows loading; `aria-busy` is set.
- Failure without data: full `ErrorState` with "Try again". Failure after data was loaded: inline alert above the previous data.
- Charts load lazily with a skeleton placeholder and include a screen-reader text summary.
- Panels show an empty state when they have no rows. The bell shows skeleton, error with retry, or "No alerts".
- Dashboard and alerts use separate service keys, so the bell keeps working when the dashboard fails (verified).

### 11. Permissions

| Section                                                                                         | Permission                                                |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Registered users, New registrations KPIs; Registrations chart                                   | `users:view`                                              |
| Active Trends KPI and chart                                                                     | `trends:view`                                             |
| Pending moderation KPI, Moderation donut, Pending moderation panel                              | `moderation:view`                                         |
| Active contests KPI                                                                             | `contests:view`                                           |
| Premium subscriptions KPI and donut                                                             | `subscriptions:view`                                      |
| Transaction volume and Financial exceptions KPIs, Transaction chart, Financial exceptions panel | `finance:view`                                            |
| Recent admin activity panel                                                                     | `audit:view`                                              |
| Recent alerts panel and bell                                                                    | Each alert's own permission                               |
| System health panel                                                                             | All roles ("Operations" link only with `operations:view`) |

### 12. Business rules

- All values are labeled "Demo data", "Simulated" or "Simulated status".
- Contest payouts are not shown because paid contests are activation-gated (feature flag, legal and provider approval).
- KPI change shows an arrow and signed percentage; metrics where lower is better (pending cases, exceptions) color increases as negative.
- Times are shown in UTC.

### 13. Testing

Manual (verified 2026-10-28):

1. Sign in as Super Administrator: 8 KPIs, 5 charts and 5 panels; bell shows 7 unread.
2. Switch to 7 and 90 days: KPI values, subtitle and charts change. Refresh shows loading, then clears.
3. Finance Administrator: only contests, subscriptions and finance KPIs, the subscriptions and transactions charts, exceptions, alerts and health panels; 2 alerts. Contest Administrator: contests KPI, one alert, health.
4. Bell: clicking an alert navigates and reduces the unread count; "Mark all as read" clears it.
5. Midnight dark theme: charts, axes and legends recolor.
6. `NEXT_PUBLIC_MOCK_FAIL_SERVICES=dashboard NEXT_PUBLIC_MOCK_DELAY_MS=2500 npm run dev`: skeletons, then "The dashboard could not be loaded" with "Try again"; the bell still loads.
7. 390px wide: single column, no horizontal overflow. No hydration errors after reload.
   Automated tests: not yet available.

### 14. Files changed

`src/features/dashboard/*`, `src/features/notifications/*`, `src/data/mock/{dashboard.ts,index.ts}`, `src/services/{contracts,mock}/dashboardService.ts`, `src/services/index.ts`, `src/store/rootReducer.ts`, `src/components/dashboard/{DashboardScreen.tsx,charts/*,panels/*}`, `src/components/layout/{NotificationBell.tsx,AdminHeader.tsx}`, `src/app/admin/(portal)/dashboard/page.tsx`, `src/lib/formatters/number.ts` (`formatCompactCurrency`).

### 15. Backend integration requirements

Proposed, not defined:

- `GET /admin/dashboard/summary?range=7d|30d|90d` returning the `DashboardSummary` shape, filtered server-side by the caller's role.
- `GET /admin/alerts` returning `DashboardAlert[]` for the caller, with server-side read state.
- Metrics must come from audited analytics sources; KPI definitions (for example what counts as an active Trend or a qualified share) need owner approval.

### 16. Known limitations

- All data is fictional and static for `DEMO_AS_OF`; the dashboard does not reflect demo mutations made in other modules except audit events in "Recent admin activity".
- Range presets only; no custom date picker.
- Alert read state lasts for the browser session.
- Every linked module page exists (Phases 5 and 6). Exception and activity rows open the matching record.
- The 90-day weekly transaction view starts with a 6-day bucket.
