# Testing

## Automated checks

| Command                | What it checks                                                             |
| ---------------------- | -------------------------------------------------------------------------- |
| `npm run lint`         | ESLint (Next.js core web vitals, TypeScript rules, Prettier compatibility) |
| `npm run typecheck`    | `tsc --noEmit` in strict mode                                              |
| `npm run build`        | Production build, including route type generation                          |
| `npm run format:check` | Prettier formatting                                                        |

No unit or component test runner is configured yet. The recommended setup when module logic arrives (Phase 4) is Vitest with React Testing Library for slices, selectors, services and components. That is a proposal and is not yet installed.

## Manual verification (Phase 1)

### Layout separation

1. Open `/`. The public header and footer show. No admin sidebar.
2. Open `/admin/login`. The standalone sign-in layout shows.
3. Sign in. The admin shell shows. No public header.

### Demo sign-in and session

1. On `/admin/login`, account skeletons appear briefly, then five accounts.
2. Select an account and choose **Enter demo portal**. You land on `/admin/dashboard`.
3. Refresh. You stay signed in.
4. Open `/admin/users` in a fresh browser profile. You are redirected to `/admin/login?next=%2Fadmin%2Fusers`, and after sign-in you return to `/admin/users`.
5. **Sign out of demo** returns you to the sign-in page.

### Role permissions

1. Sign in as Super Administrator. All sidebar sections show.
2. Switch to Finance Administrator from the profile menu. Only Dashboard, Contests, Subscriptions and Finance remain. A success message confirms the switch.
3. While on `/admin/users/u-1042` as Finance Administrator, the page shows "Not available for your role".
4. Repeat for each role and compare with the matrix in [AUTHENTICATION_AND_ROLES.md](AUTHENTICATION_AND_ROLES.md).

### Theme switching

1. Open the theme switcher (paint icon) on the public site, the sign-in page and the admin header.
2. Switch Light and Dark, and each preset. Surfaces, sidebar, text, antd popovers and messages all update.
3. Refresh on a non-default theme. Custom surfaces render in the saved theme immediately. The dev overlay shows no hydration errors.
4. **Reset to default** returns to TrenderAlert light.

### Loading and error states

1. Set `NEXT_PUBLIC_MOCK_DELAY_MS=2500` in `.env.local` and restart. Sign-in skeletons stay visible longer.
2. Set `NEXT_PUBLIC_MOCK_FAIL_SERVICES=auth` and restart. The sign-in page shows "Demo accounts could not be loaded" with **Try again**.

### Dashboard and alerts (Phase 4)

1. As Super Administrator, `/admin/dashboard` shows 8 KPI cards, 5 charts and 5 panels. The bell shows 7 unread.
2. Switch 7, 30 and 90 days: KPI values, the subtitle and charts change. **Refresh** shows a loading state, then clears.
3. Switch to Finance Administrator: only finance, subscription and contest figures remain; the bell shows 2 alerts.
4. Click a KPI card or a panel row: the related admin page opens.
5. Open the bell, click an alert: it navigates and the unread count drops. **Mark all as read** clears the count.
6. Change to a dark theme: charts, axes and legends recolor.
7. Restart with `NEXT_PUBLIC_MOCK_FAIL_SERVICES=dashboard NEXT_PUBLIC_MOCK_DELAY_MS=2500`: skeletons appear, then "The dashboard could not be loaded" with **Try again**. The bell still loads because alerts use the `notifications` key.

### Navigation and 404

1. Visit `/admin/users/u-1042`. Breadcrumbs show Home / Users / u-1042, and Users is highlighted in the sidebar.
2. Visit `/admin/does-not-exist`. The admin 404 shows inside the shell.
3. Visit `/nope`. The global 404 shows.

### Responsive layouts

1. Below 992px, the admin sidebar hides and the menu button opens a drawer with the same role-filtered navigation.
2. Below 768px, public header links collapse into a menu drawer.
3. The collapse button (desktop) shrinks the sidebar to icons, and the state persists across refreshes.

## Testing Redux flows (when the runner is added)

- Test slices by dispatching thunks against a fresh `makeStore()` and asserting status transitions `idle -> loading -> succeeded|failed`.
- Set `NEXT_PUBLIC_MOCK_DELAY_MS=0` for tests and use `NEXT_PUBLIC_MOCK_FAIL_SERVICES` to force failures.
- Test permission logic through `roleHasPermission` and `getNavigationForRole`.
