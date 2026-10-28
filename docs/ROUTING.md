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

| Route                     | Behavior                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/admin`                  | Server redirect to `/admin/dashboard`                                                                               |
| `/admin/login`            | Demo sign-in. Outside the admin shell. Accepts `?next=/admin/...`                                                   |
| `/admin/*` (registered)   | Rendered inside the admin shell. Until a module is built, the catch-all shows a "scheduled for phase N" placeholder |
| `/admin/*` (unregistered) | Admin 404 inside the shell                                                                                          |

Registered admin routes (from `src/lib/constants/adminRoutes.ts`):

| Key                   | Path                                 | Permission               | Phase |
| --------------------- | ------------------------------------ | ------------------------ | ----- |
| dashboard             | `/admin/dashboard`                   | `dashboard:view`         | 4     |
| operations            | `/admin/operations`                  | `operations:view`        | 6     |
| users                 | `/admin/users`                       | `users:view`             | 5     |
| userDetail            | `/admin/users/[id]`                  | `users:view`             | 5     |
| content               | `/admin/content`                     | `content:view`           | 5     |
| trends                | `/admin/trends`                      | `trends:view`            | 5     |
| discovery             | `/admin/discovery`                   | `discovery:view`         | 6     |
| moderation            | `/admin/moderation`                  | `moderation:view`        | 5     |
| moderationDetail      | `/admin/moderation/[id]`             | `moderation:view`        | 5     |
| appeals               | `/admin/appeals`                     | `appeals:view`           | 5     |
| copyright             | `/admin/copyright`                   | `copyright:view`         | 5     |
| contests              | `/admin/contests`                    | `contests:view`          | 6     |
| contestDetail         | `/admin/contests/[id]`               | `contests:view`          | 6     |
| subscriptions         | `/admin/subscriptions`               | `subscriptions:view`     | 6     |
| finance               | `/admin/finance`                     | `finance:view`           | 6     |
| financeTransactions   | `/admin/finance/transactions`        | `finance:view`           | 6     |
| financeReconciliation | `/admin/finance/reconciliation`      | `finance:view`           | 6     |
| support               | `/admin/support`                     | `support:view`           | 6     |
| configuration         | `/admin/configuration`               | `configuration:view`     | 6     |
| featureFlags          | `/admin/configuration/feature-flags` | `configuration:view`     | 6     |
| adminUsers            | `/admin/security/admin-users`        | `security:manage-admins` | 6     |
| auditLogs             | `/admin/security/audit-logs`         | `audit:view`             | 6     |

## Layout boundaries

- `(public)` route group: public header and footer.
- `admin/login`: standalone sign-in layout.
- `admin/(portal)` route group: `AdminLayout` with sidebar, header, demo banner, session guard and route access guard.

## Navigation configuration

- **Registry:** `ADMIN_ROUTES` defines path, label, description, permission, phase and optional parent for every admin route.
- **Sidebar:** `ADMIN_NAVIGATION` groups route keys into sections (Overview, Community, Trust & Safety, Contests & Finance, Support, Platform). `getNavigationForRole(role)` removes items the role cannot open and drops empty groups.
- **Breadcrumbs:** `buildAdminBreadcrumbs(pathname)` walks the `parent` chain. Dynamic segments show the record id, for example Users / u-1042.
- **Active state:** detail routes highlight their nearest ancestor in the navigation.

## Adding a module route

1. Create `src/app/admin/(portal)/<path>/page.tsx`. It automatically takes precedence over the catch-all.
2. Keep the route's entry in `ADMIN_ROUTES` (path, label, permission).
3. When every registered route has a real page, delete `src/app/admin/(portal)/[...slug]/`.

## Guards

- **Session guard:** if no demo session exists after restoration, the shell redirects to `/admin/login?next=<current path>`. The login page only accepts `next` values that start with `/admin/`.
- **Route access guard:** if the current role lacks the route's permission, the page body is replaced with an "Not available for your role" state. These are UI restrictions only; see [SECURITY.md](SECURITY.md).

## Error and not-found behavior

- Global 404: `src/app/not-found.tsx`.
- Admin 404 (inside the shell): `src/app/admin/(portal)/not-found.tsx`.
- Error boundaries: `src/app/error.tsx`, `src/app/admin/(portal)/error.tsx` (both offer retry), `src/app/global-error.tsx`.
- Loading: `src/app/admin/(portal)/loading.tsx` shows a page skeleton during navigation.

## Filter and pagination preservation

Not applicable yet. Module pages in Phases 5 and 6 will keep list filters and pagination in their Redux slices so they survive navigation to detail pages and back.
