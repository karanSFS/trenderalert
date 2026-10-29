# Requirements Mapping

Status values: **Done** (interactions, state, failure states and docs complete), **Partial** (foundation in place, more work planned), **Not started**, **Blocked** (waiting on an owner input).

Sources: the frontend master prompt (sections 1-26) and the client specification (identifiers like `UX14-001`, `D-07`).

## Foundation (Phase 1)

| Requirement                                                         | Routes / components                                | State / services                | Status  | Notes                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------- | ------- | ------------------------------------------------------------------- |
| Next.js App Router, TypeScript, ESLint, formatting                  | Whole app                                          | —                               | Done    | Next 16.4.3, strict TS, Prettier                                    |
| Ant Design + styled-components + CSS variables                      | `providers/*`, `styles/*`                          | —                               | Done    | Registries collect SSR styles                                       |
| Centralized dynamic theme, 3+ presets, light/dark, persistence      | `ThemeSwitcher`, `ThemeProvider`                   | `theme` slice, `persistence.ts` | Done    | See THEME_SYSTEM.md. One-frame antd token update on refresh         |
| Black-and-yellow direction (Version 15 correction, section 2)       | All                                                | —                               | Done    | Yellow `#FFD400` per owner choice; light default                    |
| Preserve original logo (Version 15 correction, section 2)           | `BrandLogo`                                        | —                               | Blocked | Placeholder wordmark until the asset is supplied                    |
| Redux Toolkit store, typed hooks, async status pattern              | `store/*`                                          | `auth`, `theme`, `layout`       | Done    |                                                                     |
| Mock service layer with central delay and failures                  | `services/mock/mockDelay.ts`                       | `authService`                   | Done    | Env-configurable                                                    |
| Skeleton loading components                                         | `LoadingSkeleton.tsx`                              | —                               | Partial | Built. Used by login, shell, navigation loading. Module use follows |
| Separate public and admin layouts                                   | `(public)/layout.tsx`, `admin/(portal)/layout.tsx` | —                               | Done    |                                                                     |
| Shared admin route configuration                                    | `adminRoutes.ts`, `adminNavigation.tsx`            | —                               | Done    | Drives nav, breadcrumbs, titles, guards                             |
| Breadcrumbs on nested admin pages                                   | `AdminBreadcrumbs`                                 | —                               | Done    |                                                                     |
| Custom 404, loading and error states                                | `not-found.tsx`, `error.tsx`, admin equivalents    | —                               | Done    |                                                                     |
| Backend authentication for five admin roles                         | `AdminLoginScreen`, `/api/auth/*` route handlers   | `auth` slice, `apiAuthService`  | Done    | Role inferred until the backend returns it; no MFA step yet         |
| Centralized permission configuration and role-restricted navigation | `roles.ts`, `AdminSidebar`, `RouteAccessGuard`     | `selectHasPermission`           | Done    | Action-level checks arrive with modules                             |
| Demo mode clearly labeled                                           | `DemoModeBanner`, header DEMO tag, login copy      | —                               | Done    |                                                                     |
| Documentation foundation                                            | `docs/`                                            | —                               | Done    |                                                                     |

## Shared admin components (Phase 3)

| Requirement                                            | Components / helpers                                                      | Status | Notes                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| Data tables with search, filters, sorting, pagination  | `DataTable`, `FilterBar`, `SearchInput`, `listState.ts`, `applyListQuery` | Done   | Used by six Phase 5 directories; browser-verified                        |
| Preserve filters and pagination during navigation      | `createListReducers`, `createDirectorySlice`                              | Done   | Queries live in Redux per module                                         |
| Confirmation dialogs, required reasons for enforcement | `ConfirmDialog`, `useConfirm`                                             | Done   | Every enforcement action requires a reason (verified)                    |
| Form modals with validation                            | `FormModal`                                                               | Done   | Trend corrections, merges, case notes                                    |
| Detail panels                                          | `DetailDrawer`, `DetailSection`, `DetailList`                             | Done   | Content, Trends, Appeals, Copyright drawers                              |
| KPI and chart cards                                    | `MetricCard`, `ChartCard`, `useChartTheme`                                | Done   | Used and browser-verified on the dashboard (Phase 4)                     |
| Action-level role restrictions                         | `Can`, `usePermission`, `RowActions`                                      | Done   | Applied in every Phase 5 module                                          |
| Demo audit events for simulated changes                | `audit` slice, `AuditService`, `useDemoAction`                            | Done   | Recorded after every successful demo action                              |
| Avoid skeleton flashing on fast operations             | `useDelayedFlag`                                                          | Done   | Used by `DataTable`, `MetricCard`, `ChartCard`                           |
| Header notification indicator                          | `NotificationBell`, `notifications` slice                                 | Done   | Role-filtered demo alerts, unread count, mark read, navigation (Phase 4) |

## Public website (Phase 2)

| Requirement                                                        | Status  | Notes                                                                           |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------- |
| Header with Product, Features, How It Works, Privacy, Support, CTA | Done    | `PublicHeader`, `publicNav.ts`; anchors work from any page; mobile drawer       |
| Hero ("Discover What's Trending. Understand Why It Matters.")      | Done    | `HeroSection`, `HeroRadar` (illustrative radar and Trend Card)                  |
| Product preview with trend cards, TrendScore, geography, activity  | Done    | `ProductSection`, `ProductPreview`, `PreviewTrendCard`; labeled illustrative    |
| Features (approved capabilities)                                   | Done    | `FeatureSection`; six signature features                                        |
| How it works                                                       | Done    | `HowItWorksSection`; four steps                                                 |
| Privacy and trust (no unsupported guarantees)                      | Done    | `PrivacyTrustSection`; links to the pending policy                              |
| Final call to action                                               | Done    | `CallToAction`, `AppAvailability`; contact plus "coming soon" store badges      |
| Footer with legal links and copyright                              | Done    | Product and legal columns; no social links until approved destinations exist    |
| Privacy, terms, support pages                                      | Partial | Placeholder content, clearly marked; awaiting approved text                     |
| No fake app-store links                                            | Done    | Store URLs are `null` in `publicSite.ts`                                        |
| Responsive, accessible, page metadata                              | Done    | Verified at 390px and desktop; reduced motion; Open Graph title and description |
| Original logo artwork                                              | Blocked | Placeholder wordmark                                                            |

## Admin modules (Phases 4-6)

| Area                            | Route(s)                                                                            | Spec references                                    | Status                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Dashboard                       | `/admin/dashboard`                                                                  | Prompt section 10                                  | Done (see below)                                              |
| Users                           | `/admin/users`, `/admin/users/[id]`                                                 | Prompt section 11; D-10 deletion grace             | Done (`features/user-management.md`)                          |
| Content                         | `/admin/content`                                                                    | CNT14-001 Trend vs Profile Post                    | Done (`features/content-management.md`)                       |
| Trends                          | `/admin/trends`                                                                     | CNT14-002 fixed 30-day max, no extension; RANK14-* | Done (`features/trend-management.md`)                         |
| Moderation, appeals, copyright  | `/admin/moderation`, `/admin/moderation/[id]`, `/admin/appeals`, `/admin/copyright` | Prompt section 13                                  | Done (`features/moderation.md`, `appeals.md`, `copyright.md`) |
| Contests                        | `/admin/contests`, `/admin/contests/[id]`                                           | D-07, D-08; paid contests activation-gated         | Done (`features/contests.md`)                                 |
| Subscriptions and finance       | `/admin/subscriptions`, `/admin/finance/*`                                          | D-05; reconciliation goal                          | Done (`features/subscriptions.md`, `finance.md`)              |
| Support                         | `/admin/support`                                                                    | Support agent limits                               | Done (`features/support.md`)                                  |
| Discovery                       | `/admin/discovery`                                                                  | RANK14-001..004                                    | Done (`features/discovery.md`)                                |
| Configuration and feature flags | `/admin/configuration`, `/admin/configuration/feature-flags`                        | Activation-gated features                          | Done (`features/configuration.md`)                            |
| Admin users and audit logs      | `/admin/security/*`                                                                 | Super admin, all actions audited                   | Done (`features/security-and-audit.md`)                       |
| Operations                      | `/admin/operations`                                                                 | SCL14-010 monitoring                               | Done (`features/operations.md`)                               |

### Dashboard detail (Phase 4)

| Requirement                                                                                                                                          | Implementation                                            | Status | Notes                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| KPI cards: users, registrations, active Trends, pending moderation, active contests, premium subscriptions, transaction volume, financial exceptions | `DashboardScreen`, `MetricCard`, `selectVisibleKpis`      | Done   | Role-filtered; previous-period change; each links to its module                        |
| Charts: registrations, Trend activity, moderation distribution, subscription distribution, transactions                                              | `components/dashboard/charts`                             | Done   | Trend activity shows active Trends per day; contest payouts omitted (activation-gated) |
| Panels: recent activity, pending moderation, financial exceptions, system health, recent alerts                                                      | `panels/OperationalPanels.tsx`                            | Done   | Rows link to records; health is simulated                                              |
| Date-range filtering                                                                                                                                 | `Segmented` 7/30/90 days, `dashboard.range`               | Done   | Presets only                                                                           |
| Refresh                                                                                                                                              | `fetchDashboard`, stale-response guard                    | Done   |                                                                                        |
| Loading, error, empty states                                                                                                                         | Skeletons, `ErrorState`, inline alert, panel empty states | Done   | Verified with forced failure                                                           |
| Clearly labeled demo data                                                                                                                            | `DemoDataTag`, subtitle                                   | Done   |                                                                                        |
| Mock data separate from UI                                                                                                                           | `data/mock/dashboard.ts`, `DashboardService`              | Done   | Deterministic seed and reference date                                                  |

### Operational administration detail (Phase 6)

| Requirement                                                | Implementation                                                       | Status | Notes                                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| Paid-contest activation stays disabled                     | `contestActionBlock`, contests service, `paid_contests` flag gates   | Done   | Rejected in the UI and again in the service                                      |
| Legal, payment-provider and operations approvals not faked | Read-only approval badges from mock data                             | Done   | Only `ctst-300` has every approval recorded                                      |
| Refunds never overwrite transaction history                | `requestRefund` creates a linked record                              | Done   | Original keeps its amount; gains `refundedBy`                                    |
| Reconciliation resolution keeps history                    | `resolveException` appends history and a resolution                  | Done   |                                                                                  |
| Support sees limited personal data                         | Masked contact, privacy notice                                       | Done   | Masking must also be enforced by the backend                                     |
| Settings limited to approved values                        | Editable vs fixed-by-policy settings                                 | Done   | 30-day maximum, 30-day deletion grace, ages 13 and 18, one warning, remote price |
| Ranking weights validated                                  | Discovery ranking tab and service                                    | Done   | Must total 100%; labeled as a proposal                                           |
| Admins cannot change or deactivate themselves; MFA shown   | Admin users screen and service                                       | Done   | One active Super Admin always remains                                            |
| Audit log append-only, export disabled                     | Audit log screen; `auditService.record` appends to the demo database | Done   | Export shows "Requires backend authorization"                                    |
| Operations data labeled simulated                          | Operations banner and subtitle                                       | Done   | Backlog counts come from demo records                                            |
| Every admin route has a real page                          | `[...slug]` catch-all now returns 404                                | Done   | `ModulePlaceholder` removed                                                      |

## Quality (Phase 7)

| Requirement                        | Status                                 |
| ---------------------------------- | -------------------------------------- |
| Automated unit and component tests | Not started (runner not yet installed) |
| Manager demo guide                 | Not started                            |
