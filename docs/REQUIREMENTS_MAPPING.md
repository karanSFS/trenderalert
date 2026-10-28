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

## Public website (Phase 2)

| Requirement                                                           | Status      | Notes                                                                      |
| --------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| Header with Product, Features, How It Works, Privacy, Support, CTA    | Partial     | Privacy, Terms, Support and CTA exist; anchor sections arrive with Phase 2 |
| Hero ("Discover What's Trending. Understand Why It Matters.")         | Partial     | Hero copy and CTAs exist; product preview pending                          |
| Product preview, features, how it works, privacy and trust, final CTA | Not started |                                                                            |
| Footer with legal links and copyright                                 | Done        | No social links until approved destinations exist                          |
| Privacy, terms, support pages                                         | Partial     | Placeholder content, clearly marked                                        |
| No fake app-store links                                               | Done        | None present                                                               |

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
