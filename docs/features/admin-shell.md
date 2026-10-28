# Admin Shell and Demo Authentication

### 1. Overview

The shared frame for every admin page: sidebar navigation, header, breadcrumbs, demo banner, theme controls, profile menu, and the demo sign-in that decides which role is active. It lets the project manager explore the portal as any of the five administrative roles.

### 2. Requirements

- Prompt section 3: separate admin layout, shared route configuration, breadcrumbs, 404, loading and error states.
- Prompt section 4: sidebar with logo, grouped navigation, icons, active indicators, collapse, profile area, mobile navigation; header with breadcrumbs, theme controls and profile dropdown.
- Prompt section 17 and specification "Roles and permissions": five admin roles, centralized permissions, role-restricted navigation, easy role exploration.

### 3. Routes and screens

- `/admin/login`: demo sign-in.
- `/admin` redirects to `/admin/dashboard`.
- Every `/admin/*` route inside `src/app/admin/(portal)/` uses the shell.
- Dialog-like surfaces: theme popover, profile dropdown, mobile navigation drawer.

### 4. User interactions

- Choose a demo account and enter the portal. On failure an error message shows and the user can retry.
- Switch role from the profile menu. Navigation and access update, and a success message confirms the change.
- Sign out. The session clears and the sign-in page shows.
- Collapse or expand the sidebar (desktop). The state persists.
- Open the navigation drawer (below 992px).
- Change theme and appearance mode.
- Opening a route the role cannot access shows an access-restricted state with a link back to the dashboard.

### 5. Components

`AdminLayout`, `AdminSidebar`, `AdminHeader`, `AdminBreadcrumbs`, `AdminShellSkeleton`, `AdminLoginScreen`, `AdminNotFound`, plus shared `BrandLogo`, `ThemeSwitcher`, `DemoModeBanner`, `AccessDeniedState`, `PageHeader`, `StatusBadge`, `EmptyState`, `PageSkeleton`.

### 6. Redux state

- `auth` slice: `currentAdmin`, `sessionRestored`, `signInStatus` and `signInError`, `roleSwitchStatus`, `demoAccounts` with `demoAccountsStatus` and `demoAccountsError`.
- Thunks: `fetchDemoAccounts`, `signInDemo`, `switchDemoRole`, `restoreDemoSession`. Reducers: `signOut`, `clearSignInError`.
- Selectors: `selectAuth`, `selectCurrentAdmin`, `selectCurrentRole`, `selectIsAuthenticated`, `selectSessionRestored`, `selectHasPermission`.
- `layout` slice: `sidebarCollapsed` (`toggleSidebar`, `setSidebarCollapsed`).

### 7. Data model

`DemoAdminAccount { id, displayName, email, role, title, lastActiveAt }`; `AdminRole`; `Permission` (`src/types/auth.ts`). `AdminRouteDefinition { key, path, label, description, permission, phase, parent? }`.

### 8. Mock data

`src/data/mock/adminUsers.ts`, for example:

```ts
{ id: "adm-004", displayName: "Marcus Bell", email: "marcus.bell@demo.trenderalert.test",
  role: "finance_admin", title: "Finance Operations (demo)", lastActiveAt: "2026-10-26T19:28:00Z" }
```

### 9. Service layer

`AuthService` contract (`services/contracts/authService.ts`) implemented by `mockAuthService`: `listDemoAccounts`, `signInDemo`, `getDemoAccountForRole`, `restoreDemoSession`.

### 10. Loading and error handling

- Sign-in: account skeletons while loading; `ErrorState` with retry if accounts fail; inline error alert if sign-in fails; button loading state.
- Shell: `AdminShellSkeleton` until the saved session is checked; `loading.tsx` page skeleton between routes; `error.tsx` with retry.
- Role switch: success or error message.

### 11. Permissions

All roles can use the shell. Navigation items and routes are filtered by `ROLE_PERMISSIONS`. See [AUTHENTICATION_AND_ROLES.md](../AUTHENTICATION_AND_ROLES.md).

### 12. Business rules

- `next` redirect after sign-in must start with `/admin/`.
- Detail routes highlight their parent in the sidebar.
- Demo session persistence stores only the account id.

### 13. Testing

Manual steps in [TESTING.md](../TESTING.md) (sign-in, role permissions, navigation, responsive). Automated tests are not yet available.

### 14. Files changed

`src/components/layout/*`, `src/components/auth/AdminLoginScreen.tsx`, `src/components/admin/*`, `src/features/auth/*`, `src/features/settings/layoutSlice.ts`, `src/lib/constants/{adminRoutes.ts,adminNavigation.tsx,roles.ts}`, `src/services/*`, `src/data/mock/adminUsers.ts`, `src/app/admin/**`.

### 15. Backend integration requirements

- Real admin authentication with MFA and server-issued sessions (proposed; scheme not defined).
- An endpoint returning the current admin and role, used instead of `restoreDemoSession` (proposed).
- Server-side authorization for every admin request.
- Remove `listDemoAccounts`, `getDemoAccountForRole` and the role switcher in production.

### 16. Known limitations

- Demo sign-in has no credentials; role checks are UI only.
- Notifications indicator and global search are not included yet; they will be added with the dashboard and modules if supported by demo data.
- The logo is a placeholder.
