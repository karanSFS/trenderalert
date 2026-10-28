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
| Demo authentication with five roles, role switcher                  | `AdminLoginScreen`, `AdminHeader`                  | `auth` slice, `authService`     | Done    | UI only                                                             |
| Centralized permission configuration and role-restricted navigation | `roles.ts`, `AdminSidebar`, `RouteAccessGuard`     | `selectHasPermission`           | Done    | Action-level checks arrive with modules                             |
| Demo mode clearly labeled                                           | `DemoModeBanner`, header DEMO tag, login copy      | —                               | Done    |                                                                     |
| Documentation foundation                                            | `docs/`                                            | —                               | Done    |                                                                     |

## Shared admin components (Phase 3)

| Requirement                                            | Components / helpers                                                      | Status      | Notes                                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| Data tables with search, filters, sorting, pagination  | `DataTable`, `FilterBar`, `SearchInput`, `listState.ts`, `applyListQuery` | Partial     | Built and type-checked; browser verification with the first directory (Phase 5) |
| Preserve filters and pagination during navigation      | `createListReducers` (query in Redux)                                     | Partial     | Pattern in place; applies as modules adopt it                                   |
| Confirmation dialogs, required reasons for enforcement | `ConfirmDialog`                                                           | Partial     | Built; first use in Phase 5                                                     |
| Form modals with validation                            | `FormModal`                                                               | Partial     | Built; first use in Phase 5                                                     |
| Detail panels                                          | `DetailDrawer`, `DetailSection`, `DetailList`                             | Partial     | Built; first use in Phase 5                                                     |
| KPI and chart cards                                    | `MetricCard`, `ChartCard`, `useChartTheme`                                | Partial     | Built; first use in Phase 4                                                     |
| Action-level role restrictions                         | `Can`, `usePermission`, `RowActions`                                      | Partial     | Built; applied per module                                                       |
| Demo audit events for simulated changes                | `audit` slice, `AuditService`                                             | Partial     | Built; modules dispatch after successful mutations                              |
| Avoid skeleton flashing on fast operations             | `useDelayedFlag`                                                          | Done        | Used by `DataTable`, `MetricCard`, `ChartCard`                                  |
| Header notification indicator                          | —                                                                         | Not started | Needs Phase 4 alert data                                                        |

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

| Area                            | Route(s)                                                     | Spec references                                    | Status                    |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- | ------------------------- |
| Dashboard                       | `/admin/dashboard`                                           | Prompt section 10                                  | Not started (placeholder) |
| Users                           | `/admin/users`, `/admin/users/[id]`                          | Prompt section 11; D-10 deletion grace             | Not started               |
| Content                         | `/admin/content`                                             | CNT14-001 Trend vs Profile Post                    | Not started               |
| Trends                          | `/admin/trends`                                              | CNT14-002 fixed 30-day max, no extension; RANK14-* | Not started               |
| Moderation, appeals, copyright  | `/admin/moderation`, `/admin/appeals`, `/admin/copyright`    | Prompt section 13                                  | Not started               |
| Contests                        | `/admin/contests`                                            | D-07, D-08; paid contests activation-gated         | Not started               |
| Subscriptions and finance       | `/admin/subscriptions`, `/admin/finance/*`                   | D-05; reconciliation goal                          | Not started               |
| Support                         | `/admin/support`                                             | Support agent limits                               | Not started               |
| Discovery                       | `/admin/discovery`                                           | RANK14-001..004                                    | Not started               |
| Configuration and feature flags | `/admin/configuration`, `/admin/configuration/feature-flags` | Activation-gated features                          | Not started               |
| Admin users and audit logs      | `/admin/security/*`                                          | Super admin, all actions audited                   | Not started               |
| Operations                      | `/admin/operations`                                          | SCL14-010 monitoring                               | Not started               |

## Quality (Phase 7)

| Requirement                        | Status                                 |
| ---------------------------------- | -------------------------------------- |
| Automated unit and component tests | Not started (runner not yet installed) |
| Manager demo guide                 | Not started                            |
