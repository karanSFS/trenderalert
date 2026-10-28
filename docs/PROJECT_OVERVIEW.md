# Project Overview

## Purpose

TrenderAlert is a trend discovery and participation platform ("See It First"). This repository is the web frontend. It has two experiences:

1. **Public website** (`/`): explains the product and links to legal and support pages.
2. **Administration portal** (`/admin`): a demo of the staff tools for users, content, trends, trust and safety, contests, subscriptions, finance, support, discovery, configuration and audit.

The portal exists to demonstrate realistic flows to the project manager. It is built so that the mock data layer can later be replaced by real APIs without rewriting the UI.

## Technology stack

| Area            | Choice                                                         |
| --------------- | -------------------------------------------------------------- |
| Framework       | Next.js 16 (App Router), React 19, TypeScript (strict)         |
| UI library      | Ant Design 6 (`antd`, `@ant-design/icons`)                     |
| Custom styling  | styled-components 6, CSS Modules, CSS variables                |
| State           | Redux Toolkit 2, React Redux 9                                 |
| Charts          | `@ant-design/charts` (installed; used from Phase 4)            |
| Tooling         | ESLint (Next config + Prettier compatibility), Prettier, `tsc` |
| Package manager | npm                                                            |

## Application structure

```
src/
  app/                 Routes (public route group, admin, not-found, error)
  components/
    admin/             Admin-only screens (module placeholder, admin 404)
    auth/              Demo sign-in screen
    layout/            Admin shell: layout, sidebar, header, breadcrumbs
    promotional/       Public header, footer and landing-page sections
    ui/                Shared UI: PageHeader, StatusBadge, states, skeletons, theme switcher
  content/             Static public-site copy and illustrative preview content
  data/mock/           Fictional, deterministic mock datasets
  features/            Redux slices, selectors and types per domain
  lib/constants/       App constants, roles/permissions, admin route registry, navigation
  lib/formatters/      Pure formatting helpers
  providers/           Store, theme and style-registry providers
  services/            Service contracts, mock implementations and the service registry
  store/               Store setup, root reducer, typed hooks, persistence middleware
  styles/              Theme tokens, CSS variables, Ant Design and styled-components themes
  types/               Shared types (API, auth, common)
docs/                  This documentation
```

## Main routes

See [ROUTING.md](ROUTING.md). In short: `/`, `/privacy`, `/terms`, `/support`, `/admin/login`, and the registered `/admin/*` module routes.

## Current demo limitations

- No backend. All data is fictional and served by the mock service layer with simulated latency.
- Demo sign-in has no passwords. Role checks are UI-only and provide no security.
- The TrenderAlert logo is a **placeholder wordmark** until the owner supplies the original artwork.
- Legal, privacy and support page copy are placeholders awaiting approved text.
- Phases 1 and 2 are complete (foundation and public website). Admin module routes still show a "scheduled for phase N" placeholder.
- The public product preview uses illustrative, fictional Trends and is labeled as such.
- No automated test runner is configured yet (see [TESTING.md](TESTING.md)).

## Development conventions

See [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md).

## Running the app

```bash
npm install
cp .env.example .env.local   # optional: tune mock delay and failures
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck
npm run build
```
