# Authentication and Roles

## Demo authentication

The portal uses a demo sign-in at `/admin/login`. There are no passwords. The user picks one of the demo administrators below and enters the portal. The session (only the account id) is stored in `localStorage["ta.demoSession"]` so a refresh keeps the user signed in.

**This is not authentication.** Anyone can open any role. It exists only to demonstrate role-based navigation.

## Demo accounts

All accounts are fictional. The `.test` domain is reserved and cannot receive email. Source: `src/data/mock/adminUsers.ts`.

| Account id | Name            | Role                  | Email                                  |
| ---------- | --------------- | --------------------- | -------------------------------------- |
| `adm-001`  | Avery Collins   | Super Administrator   | avery.collins@demo.trenderalert.test   |
| `adm-002`  | Jordan Reyes    | Content Moderator     | jordan.reyes@demo.trenderalert.test    |
| `adm-003`  | Priya Natarajan | Support Agent         | priya.natarajan@demo.trenderalert.test |
| `adm-004`  | Marcus Bell     | Finance Administrator | marcus.bell@demo.trenderalert.test     |
| `adm-005`  | Sofia Laurent   | Contest Administrator | sofia.laurent@demo.trenderalert.test   |

## Exploring roles

- On the sign-in page, choose an account and select **Enter demo portal**.
- Inside the portal, open the profile menu (top right) and choose a role under **Switch demo role**. The sidebar and route access update immediately.
- **Sign out of demo** clears the session and returns to the sign-in page.

## Roles

Role summaries follow the specification's "Roles and permissions" table.

| Role                  | Summary                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Super Administrator   | Manages roles and system configuration. All actions audited.                                     |
| Content Moderator     | Reviews reports and applies policy actions with audit logs.                                      |
| Support Agent         | Views support cases and limited account metadata. Cannot view secrets or payment credentials.    |
| Finance Administrator | Reconciles transactions, refunds, fees and payouts. No content moderation authority by default.  |
| Contest Administrator | Manages an approved contest within locked rules. Cannot change material terms after publication. |

## Permission configuration

Permissions are defined in `src/types/auth.ts` and mapped to roles in `src/lib/constants/roles.ts` (`ROLE_PERMISSIONS`). Use `roleHasPermission(role, permission)` or the `selectHasPermission` selector.

| Permission                                | Super | Moderator | Support | Finance | Contest |
| ----------------------------------------- | :---: | :-------: | :-----: | :-----: | :-----: |
| dashboard:view                            |  Yes  |    Yes    |   Yes   |   Yes   |   Yes   |
| operations:view                           |  Yes  |           |         |         |         |
| users:view                                |  Yes  |    Yes    |   Yes   |         |         |
| users:manage                              |  Yes  |           |         |         |         |
| content:view                              |  Yes  |    Yes    |         |         |   Yes   |
| content:moderate                          |  Yes  |    Yes    |         |         |         |
| trends:view / trends:manage               |  Yes  |    Yes    |         |         |         |
| discovery:view / discovery:manage         |  Yes  |           |         |         |         |
| moderation:view / moderation:act          |  Yes  |    Yes    |         |         |         |
| appeals:view / appeals:decide             |  Yes  |    Yes    |         |         |         |
| copyright:view / copyright:manage         |  Yes  |    Yes    |         |         |         |
| contests:view                             |  Yes  |           |         |   Yes   |   Yes   |
| contests:manage                           |  Yes  |           |         |         |   Yes   |
| subscriptions:view                        |  Yes  |           |   Yes   |   Yes   |         |
| finance:view / finance:manage             |  Yes  |           |         |   Yes   |         |
| support:view / support:manage             |  Yes  |           |   Yes   |         |         |
| configuration:view / configuration:manage |  Yes  |           |         |         |         |
| security:manage-admins                    |  Yes  |           |         |         |         |
| audit:view                                |  Yes  |           |         |         |         |

Assumptions (conservative, to be confirmed by the owner):

- Content moderators can view users (needed to act on reported accounts) but not change account status outside moderation actions.
- Support agents can view subscriptions to answer entitlement questions but not finance records.
- Finance administrators can view contests for payout context but cannot manage them.
- Contest administrators can view content to review entries.

## Route-level restrictions

Each admin route declares a permission in `ADMIN_ROUTES`. The sidebar hides routes the role cannot open, and `RouteAccessGuard` in `AdminLayout` replaces the page with an access-restricted state if a role navigates to one directly.

## Action-level restrictions

Two helpers enforce action-level UI restrictions (Phase 3):

- `usePermission(permission)` / `usePermissionChecker()` in `src/features/auth/usePermission.ts`.
- `<Can permission="users:manage" fallback={...}>` in `src/components/auth/Can.tsx`.

`RowActions` items accept a `permission` and are hidden when the role lacks it. Module screens (Phase 5 onward) use these for every `*:manage`, `*:act` and `*:decide` action. As with route checks, these restrictions are UI-only.

Phase 6 action permissions:

| Screen                                | View                     | Act                                    |
| ------------------------------------- | ------------------------ | -------------------------------------- |
| Contests                              | `contests:view`          | `contests:manage`                      |
| Subscriptions                         | `subscriptions:view`     | None (store-managed, read-only)        |
| Finance, transactions, reconciliation | `finance:view`           | `finance:manage`                       |
| Support                               | `support:view`           | `support:manage`                       |
| Discovery                             | `discovery:view`         | `discovery:manage`                     |
| Configuration, feature flags          | `configuration:view`     | `configuration:manage`                 |
| Admin users                           | `security:manage-admins` | `security:manage-admins`               |
| Audit logs                            | `audit:view`             | None (append-only; export disabled)    |
| Operations                            | `operations:view`        | Acknowledge incident (same permission) |

## Administrator accounts (Phase 6)

The Admin users screen lists the five demo sign-in accounts plus fictional colleagues, with role, status and MFA status. Rules shown in the demo and expected from the backend:

- Administrators cannot change their own role or deactivate themselves.
- At least one active Super Administrator must remain.
- Invitations record an invited account only; no email is sent, and demo invites must use the fictional `@demo.trenderalert.test` domain.
- MFA is displayed as a status. No passwords, tokens or MFA secrets exist anywhere in the frontend.

Changing a role here does not change what the demo sign-in accounts can do; the role switcher still controls the current demo session.

## Production authentication requirements

Before production use, the backend must provide:

- Real administrator authentication with strong credentials and multi-factor authentication (the specification requires strong authentication for super administrators).
- Server-side authorization for every request. Frontend role checks are convenience only.
- Server-issued sessions (for example httpOnly cookies) instead of `localStorage`.
- Audit logging of every administrative action on the server.
- Role assignment managed by super administrators and itself audited.

The exact authentication scheme and endpoints are not defined yet. Anything in this frontend that hints at them is a proposal.
