# Changelog

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
