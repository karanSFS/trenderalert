# Changelog

## 2026-10-28 — Phase 5: Core administration

**Feature:** Users, Content, Trends, Moderation, Appeals and Copyright modules, plus a hidden sidebar scrollbar.

**Main files affected**

- Data: `src/data/mock/{seed,users,trends,content,moderation,appeals,copyright,auditHistory}.ts`; `dashboard.ts` now uses the shared seed module (its output is unchanged).
- Services: `src/services/mock/db.ts` (in-memory demo database), six mock services, `services/contracts/{directory,moduleServices}.ts`, `services/index.ts`.
- State: `src/store/createDirectorySlice.ts`; slices in `src/features/{users,content,trends,moderation,appeals,copyright}/`; `src/features/moduleSelectors.ts`; `listState.ts` (request guard, boolean toggles excluded from the filter count).
- UI: `src/components/{users,content,trends,moderation,appeals,copyright}/*`; shared `useConfirm`, `Timeline`, `EntityLink`, `SectionCard`, `Identity`, `RecordState`; hooks `useDirectoryList`, `useDemoAction`, `useOpenParam`; `lib/constants/statusLabels.ts`. `DetailDrawer` actions moved into a toolbar.
- Routes: `src/app/admin/(portal)/{users,users/[id],content,trends,moderation,moderation/[id],appeals,copyright}`.
- `AdminSidebar.tsx`: the scrollbar is hidden and the menu still scrolls.

**Behavior added**

- Six directories with search, filters, sorting, pagination, empty states, and queries kept in Redux across navigation.
- Users detail page with profile, safety, subscription, deletion status, moderation history and audit history. Moderation case page with assignment, notes, decision bar, prior cases and history.
- Drawers for content, Trends, appeals and copyright, deep-linkable with `?open=`.
- Simulated actions, each with a required reason where it is an enforcement, eligibility checks, success or error feedback, and a demo audit event:
  - restrict, suspend and reinstate accounts;
  - remove, limit and restore content;
  - feature, suppress, end early, correct fields and merge Trends (no extension possible);
  - dismiss, warn, remove or limit content, restrict or suspend accounts, and escalate cases;
  - uphold or reverse appeals;
  - verify evidence, remove content, restore content and reject copyright notices.
- Cross-module consistency through the shared demo database. For example, suspending from a case suspends the user, and reversing an appeal restores the content.
- Seeded data is consistent with the dashboard: 79 open cases with the same category split, and every referenced id exists.

**Verified**

- Browser: users directory, restrict flow with validation, user detail and audit history, Trend drawer, end early, and the moderation queue.
- Script against the mock services: every cross-module effect and eligibility rule.
- `lint`, `typecheck` and `build`.

**Documentation updated:**

- New feature docs: `features/{user-management,content-management,trend-management,moderation,appeals,copyright}.md`.
- Updated: `REQUIREMENTS_MAPPING.md`, `ROUTING.md`, `MOCK_DATA_GUIDE.md`, `MOCK_API_INTEGRATION.md`, `REDUX_STATE_MANAGEMENT.md`, `TESTING.md` and `features/shared-admin-components.md`.

**Known limitations**

- Demo changes reset on refresh.
- Dashboard figures do not change after demo actions.
- There are no media previews.
- Directories are samples (60 users, 60 Trends, 100 content items).

## 2026-10-28 — Phase 4: Dashboard and notification bell

**Feature:** Working, role-aware admin dashboard and header alerts.

**Main files affected**

- Data and services: `src/data/mock/dashboard.ts`, `src/services/{contracts,mock}/dashboardService.ts`, `src/services/index.ts`
- State: `src/features/dashboard/*`, `src/features/notifications/*`, `src/store/rootReducer.ts`
- UI: `src/components/dashboard/DashboardScreen.tsx`, `charts/{DashboardCharts,index}.tsx`, `panels/{Panel,OperationalPanels,statusTones}`, `src/components/layout/{NotificationBell,AdminHeader}.tsx`
- Route: `src/app/admin/(portal)/dashboard/page.tsx` (replaces the placeholder)
- `src/lib/formatters/number.ts` (`formatCompactCurrency`)

**Behavior added**

- Eight KPI cards with previous-period comparison, links to modules, and role filtering.
- Five lazily loaded, theme-aware charts with text summaries. The charts are registrations, active Trends, moderation categories, subscription plans, and charges versus refunds.
- Five operational panels: pending moderation, financial exceptions, recent admin activity (including this session's demo audit events), recent alerts and simulated system health.
- 7, 30 and 90 day range presets with Refresh. A stale-response guard prevents an older request from overwriting newer data.
- Skeletons on first load, inline alert on refresh failure, full error state with retry, and per-panel empty states.
- Header notification bell with role-filtered alerts, unread badge, mark read and mark all read, and navigation.
- Deterministic 180-day mock series generated from a fixed seed and reference date (`DEMO_AS_OF`).

**Adjustments made during verification**

- "Trend activity" shows active Trends per day as a line chart. The planned new-versus-expired series overlapped almost exactly, and an area chart forced a zero baseline that flattened the trend.
- Transaction buckets are daily for 7 and 30 days and weekly, aligned to the end of the range, for 90 days, so the latest bucket is never partial.
- The active contests series was smoothed to avoid misleading percentage swings.

**Documentation updated:** `features/dashboard.md` (new), `REQUIREMENTS_MAPPING.md`, `ROUTING.md`, `MOCK_DATA_GUIDE.md`, `MOCK_API_INTEGRATION.md`, `REDUX_STATE_MANAGEMENT.md`, `TESTING.md`, `features/shared-admin-components.md`.

**Known limitations**

- Data is static for the demo reference date. Demo mutations in other modules do not change dashboard figures, apart from audit events.
- Alert read state lasts only for the session.
- Linked module pages remain placeholders until Phases 5 and 6.

## 2026-10-28 — Phase 3: Shared admin components

**Feature:** Reusable building blocks for admin modules.

**Main files affected**

- UI: `src/components/ui/{SearchInput,FilterBar,DataTable,RowActions,ConfirmDialog,FormModal,DetailDrawer,DemoDataTag}.tsx`, `LoadingSkeleton.tsx` (`TableSkeleton` `bare` option)
- Dashboard: `src/components/dashboard/{MetricCard,ChartCard}.tsx`, `src/styles/chartTheme.ts`
- Permissions: `src/features/auth/usePermission.ts`, `src/components/auth/Can.tsx`
- State and services: `src/store/listState.ts`, `src/services/mock/query.ts`, `src/features/audit/*`, `src/services/{contracts,mock}/auditService.ts`, `src/services/index.ts`, `src/store/rootReducer.ts`
- Utilities: `src/lib/hooks/useDelayedFlag.ts`, `src/lib/formatters/{date,number}.ts`, `src/lib/errors.ts`
- `src/app/globals.css` (drawer max width), `package.json` (`dayjs` as a direct dependency)

**Behavior added**

- Directory table with delayed skeletons, refetch overlay, error with retry, empty state, controlled sort and pagination, and keyboard-accessible row clicks.
- Search and declarative filter bar with active-filter count and reset.
- Permission-filtered row action menus, plus `Can` and `usePermission` for action-level restrictions.
- Confirmation dialog with a consequence list and required reason. The form modal validates input. Both stay open and show the error when an action fails.
- Detail drawer with sections and label-value lists.
- Metric and chart cards with demo tags and fixed heights. The chart theme follows the active preset and mode.
- List-state helpers that keep queries in Redux, and a mock `applyListQuery` for search, filter, sort and pagination.
- Shared `audit` slice and `recordDemoAuditEvent` thunk.
- Deterministic date and number formatters.

**Documentation updated:** `features/shared-admin-components.md` (new), `DESIGN_SYSTEM.md`, `REDUX_STATE_MANAGEMENT.md`, `MOCK_API_INTEGRATION.md`, `AUTHENTICATION_AND_ROLES.md`, `REQUIREMENTS_MAPPING.md`.

**Known limitations**

- No showcase page, by owner choice. Components are first verified in the browser in Phases 4 and 5.
- No unit test runner. Integration was checked with temporary type-check and runtime scripts, which were then removed.
- The header notification indicator is deferred to Phase 4.

## 2026-10-28 — Phase 2: Promotional website

**Feature:** Full public landing page at `/`.

**Main files affected**

- `src/content/landing.ts` (copy and illustrative preview data), `src/lib/constants/publicSite.ts`
- `src/components/promotional/`: `HeroSection`, `HeroRadar`, `ProductSection`, `ProductPreview`, `PreviewTrendCard`, `FeatureSection`, `HowItWorksSection`, `PrivacyTrustSection`, `CallToAction`, `AppAvailability`, `SectionHeading`, `PublicFooter`, `publicNav.ts`, `icons.ts` and their CSS Modules
- `src/app/(public)/page.tsx`, `src/app/globals.css`

**Behavior added**

- Header anchors for Product, Features, How It Works and Privacy, plus Support and a Contact CTA. Anchors work from any public page, and the mobile drawer uses the same links.
- Hero with "Explore What's Next" and "How it works" CTAs and a decorative radar with an illustrative Trend Card. The animation is disabled under reduced motion.
- Interactive illustrative product preview: a scope switcher (Near You, City, Nationwide, Global) over Trend Cards showing lifecycle stage, TrendScore, location, reason, origin credit, time left and activity, plus the five Trend Card questions.
- Features (six signature capabilities), how it works (four steps), privacy and trust (six points with a link to the pending policy).
- Final CTA with contact action and "Coming to iOS / Android" badges that become links only when approved URLs are configured.
- Footer with product and legal columns.
- Page metadata with Open Graph title and description.

**Technical note:** The `@ant-design/icons` barrel creates React context at import time and cannot load in Server Components. Server sections import icons through `src/components/promotional/icons.ts`, a `"use client"` re-export.

**Documentation updated:** `features/promotional-website.md` (new, with a copy-to-spec traceability table), `REQUIREMENTS_MAPPING.md`, `ROUTING.md`, `DESIGN_SYSTEM.md`.

**Known limitations**

- Logo placeholder; no real product screenshots; legal copy and store URLs pending.
- Preview places and handles are fictional.

## 2026-10-28 — Phase 1: Project foundation

**Feature:** Project scaffold, theme system, Redux store, demo authentication, admin shell, public site shell, route registry and documentation foundation.

**Main files affected**

- Config: `next.config.ts`, `eslint.config.mjs`, `.prettierrc.json`, `.env.example`, `package.json`
- Theme: `src/styles/themes.ts`, `antdTheme.ts`, `styledTheme.ts`, `themeScript.ts`, `tokens.css`, `styled-components.d.ts`
- Providers: `src/providers/AppProviders.tsx`, `StoreProvider.tsx`, `ThemeProvider.tsx`, `StyledComponentsRegistry.tsx`
- State: `src/store/*`, `src/features/auth/*`, `src/features/settings/*`
- Services and data: `src/services/*`, `src/data/mock/adminUsers.ts`
- Config constants: `src/lib/constants/app.ts`, `roles.ts`, `adminRoutes.ts`, `adminNavigation.tsx`
- UI: `src/components/ui/*`, `src/components/layout/*`, `src/components/promotional/*`, `src/components/auth/AdminLoginScreen.tsx`, `src/components/admin/*`
- Routes: `src/app/layout.tsx`, `(public)/*`, `admin/*`, `not-found.tsx`, `error.tsx`, `global-error.tsx`

**Behavior added**

- Next.js 16.4 App Router app with TypeScript strict, ESLint and Prettier.
- Three theme presets (TrenderAlert, Midnight Signal, Graphite Amber) with light and dark modes. Tokens are synced to CSS variables, the Ant Design theme and the styled-components theme. The choice persists without hydration mismatches.
- Redux store with `auth`, `theme` and `layout` slices, typed hooks and a localStorage persistence listener.
- Centralized mock request helper with configurable delay and simulated failures.
- Demo sign-in with five fictional administrators, one per role. Role switcher in the profile menu.
- Admin shell: collapsible, role-filtered sidebar with groups and submenus, mobile drawer, header with breadcrumbs, theme switcher, profile menu and demo banner. Session guard and route access guard.
- Public layout with header, mobile menu, footer and a Phase 1 hero. Placeholder privacy, terms and support pages, clearly marked.
- Global and admin 404 pages and error boundaries with retry.
- A temporary catch-all page for registered admin modules that are not built yet.

**Configuration changes**

- Disabled `cacheComponents` and `partialPrefetching` from the scaffold. Ant Design's CSS-in-JS calls `Date.now()` and `Math.random()` during render, which Cache Components rejects during prerendering. Details are in `ARCHITECTURE.md`.
- Enabled `compiler.styledComponents`.

**Documentation updated:** all files in `docs/`, plus the feature template and `features/admin-shell.md`.

**Known limitations**

- The logo is a placeholder wordmark until the owner supplies the original artwork.
- Legal, privacy and support copy are placeholders.
- No unit test runner yet.
- On a hard refresh with a non-default theme, Ant Design components can show default tokens for one frame.
- Demo authentication and role checks are UI-only.
