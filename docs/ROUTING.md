# Routing

## Public routes

| Route      | File                                | Status                                  |
| ---------- | ----------------------------------- | --------------------------------------- |
| `/`        | `src/app/(public)/page.tsx`         | Full promotional landing page (Phase 2) |
| `/privacy` | `src/app/(public)/privacy/page.tsx` | Placeholder content, clearly marked     |
| `/terms`   | `src/app/(public)/terms/page.tsx`   | Placeholder content, clearly marked     |
| `/support` | `src/app/(public)/support/page.tsx` | Placeholder content, clearly marked     |

All public routes share `src/app/(public)/layout.tsx` (public header, footer, skip link).

### Landing page anchors

| Anchor           | Section                      |
| ---------------- | ---------------------------- |
| `/#product`      | Illustrative product preview |
| `/#features`     | Features                     |
| `/#how-it-works` | How it works                 |
| `/#privacy`      | Privacy and trust            |

Nav links use the `/#anchor` form so they work from any public page. `scroll-padding-top` in `globals.css` keeps section headings clear of the sticky header.

## Admin routes

| Route                                                                                                                                                                                                                                                                                                                                     | Behavior                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/admin`                                                                                                                                                                                                                                                                                                                                  | Server redirect to `/admin/dashboard`                                      |
| `/admin/login`                                                                                                                                                                                                                                                                                                                            | Demo sign-in. Outside the admin shell. Accepts `?next=/admin/...`          |
| `/admin/dashboard`                                                                                                                                                                                                                                                                                                                        | Real dashboard page (Phase 4): `src/app/admin/(portal)/dashboard/page.tsx` |
| `/admin/users`, `/admin/users/[id]`, `/admin/content`, `/admin/trends`, `/admin/moderation`, `/admin/moderation/[id]`, `/admin/appeals`, `/admin/copyright`                                                                                                                                                                               | Real module pages (Phase 5)                                                |
| `/admin/contests`, `/admin/contests/[id]`, `/admin/subscriptions`, `/admin/finance`, `/admin/finance/transactions`, `/admin/finance/reconciliation`, `/admin/support`, `/admin/discovery`, `/admin/configuration`, `/admin/configuration/feature-flags`, `/admin/security/admin-users`, `/admin/security/audit-logs`, `/admin/operations` | Real module pages (Phase 6)                                                |
| `/admin/*` (anything else)                                                                                                                                                                                                                                                                                                                | Admin 404 inside the shell (the `[...slug]` catch-all calls `notFound()`)  |

Registered admin routes (from `src/lib/constants/adminRoutes.ts`):

| Key                   | Path                                 | Permission               |
| --------------------- | ------------------------------------ | ------------------------ |
| dashboard             | `/admin/dashboard`                   | `dashboard:view`         |
| operations            | `/admin/operations`                  | `operations:view`        |
| users                 | `/admin/users`                       | `users:view`             |
| userDetail            | `/admin/users/[id]`                  | `users:view`             |
| content               | `/admin/content`                     | `content:view`           |
| trends                | `/admin/trends`                      | `trends:view`            |
| discovery             | `/admin/discovery`                   | `discovery:view`         |
| moderation            | `/admin/moderation`                  | `moderation:view`        |
| moderationDetail      | `/admin/moderation/[id]`             | `moderation:view`        |
| appeals               | `/admin/appeals`                     | `appeals:view`           |
| copyright             | `/admin/copyright`                   | `copyright:view`         |
| contests              | `/admin/contests`                    | `contests:view`          |
| contestDetail         | `/admin/contests/[id]`               | `contests:view`          |
| subscriptions         | `/admin/subscriptions`               | `subscriptions:view`     |
| finance               | `/admin/finance`                     | `finance:view`           |
| financeTransactions   | `/admin/finance/transactions`        | `finance:view`           |
| financeReconciliation | `/admin/finance/reconciliation`      | `finance:view`           |
| support               | `/admin/support`                     | `support:view`           |
| configuration         | `/admin/configuration`               | `configuration:view`     |
| featureFlags          | `/admin/configuration/feature-flags` | `configuration:view`     |
| adminUsers            | `/admin/security/admin-users`        | `security:manage-admins` |
| auditLogs             | `/admin/security/audit-logs`         | `audit:view`             |

## Layout boundaries

- `(public)` route group: public header and footer.
- `admin/login`: standalone sign-in layout.
- `admin/(portal)` route group: `AdminLayout` with sidebar, header, demo banner, session guard and route access guard.

## Navigation configuration

- **Registry:** `ADMIN_ROUTES` defines path, label, description, permission and optional parent for every admin route.
- **Sidebar:** `ADMIN_NAVIGATION` groups route keys into sections (Overview, Community, Trust & Safety, Contests & Finance, Support, Platform). `getNavigationForRole(role)` removes items the role cannot open and drops empty groups.
- **Breadcrumbs:** `buildAdminBreadcrumbs(pathname)` walks the `parent` chain. Dynamic segments show the record id, for example Users / u-1042.
- **Active state:** detail routes highlight their nearest ancestor in the navigation.

## Adding a module route

1. Add the route to `ADMIN_ROUTES` (path, label, permission, optional parent) and, if it belongs in the sidebar, to `ADMIN_NAVIGATION`.
2. Create `src/app/admin/(portal)/<path>/page.tsx`. Without it, the path falls through to the `[...slug]` catch-all and shows the admin 404.

## Guards

- **Session guard:** if no demo session exists after restoration, the shell redirects to `/admin/login?next=<current path>`. The login page only accepts `next` values that start with `/admin/`.
- **Route access guard:** if the current role lacks the route's permission, the page body is replaced with an "Not available for your role" state. These are UI restrictions only; see [SECURITY.md](SECURITY.md).

## Error and not-found behavior

- Global 404: `src/app/not-found.tsx`.
- Admin 404 (inside the shell): `src/app/admin/(portal)/not-found.tsx`.
- Error boundaries: `src/app/error.tsx`, `src/app/admin/(portal)/error.tsx` (both offer retry), `src/app/global-error.tsx`.
- Loading: `src/app/admin/(portal)/loading.tsx` shows a page skeleton during navigation.

## Filter and pagination preservation

Each directory keeps its query (search, filters, sort, page, page size) in its Redux slice, so returning from a detail page restores the list exactly.

## Drawer deep links

Content, Trends, Appeals, Copyright, Subscriptions, Transactions, Reconciliation, Support, Admin users and Audit logs open their detail drawer from the `?open=<id>` query parameter (`useOpenParam`). `EntityLink` uses it to link records across modules, for example `/admin/content?open=trd-8841` or `/admin/finance/reconciliation?open=rec-2207`. Contests and moderation cases have full pages instead. These pages render their screen inside `Suspense` because they read search params.
