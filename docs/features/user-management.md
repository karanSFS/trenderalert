# User Management

### 1. Overview

Member directory from the TrenderAlert backend with search, status and age filters, and a read-only member page.

### 2. Requirements

Prompt section 11. ADMIN-006 (support sees limited personal data).

### 3. Routes and screens

- `/admin/users` (`UsersScreen`).
- `/admin/users/[id]` (`UserDetailScreen`).

### 4. User interactions

| Action                                                                                               | Backend                                          |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Search name, username, email, phone or id                                                            | `GET /admin/users?q`                             |
| Filter by status (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `BANNED`) and age (minors / adults) | `status`, `is_minor`                             |
| Page through results (exact totals)                                                                  | `limit`, `offset`                                |
| Open a member                                                                                        | Directory search by id (no single-user endpoint) |

Account actions (warn, restrict, suspend, ban) are applied through moderation reports; the member page links to the queue.

### 5. Components

`UsersScreen` (exports `memberName`, `useContactFormatter`, `adminRoleLabel`), `UserDetailScreen`.

### 6. Redux state

`users` directory slice. Thunks `fetchUsers`, `fetchUser`.

### 7. Data model

`DirectoryUser`: id, email, phone, username, displayName, avatarUrl, accountStatus, isMinor, ageVerifyStatus, trenderScore, adminRole, createdAt.

### 8. Mock data

None on these screens. `data/mock/users.ts` remains only as the source of fictional members inside other demo modules (content, support, subscriptions); links to those members render as plain text.

### 9. Service layer

`UserDirectoryService` (`backendServices.ts`), implemented by `services/api/usersApi.ts`.

### 10. Loading and error handling

Standard table states; record-not-found page for unknown ids.

### 11. Permissions

`users:view` (Super Administrator, Content Moderator, Support Agent). Full email and phone only with `users:manage` (Super Administrator); everyone else sees masked values.

### 12. Business rules

Contact details are masked by default. Administrator accounts show their role.

### 13. Testing

Verified against the backend: 765 members, search, status filter, paging and the member page.

### 14. Files changed

`src/components/users/*`, `src/features/users/*`, `src/services/api/usersApi.ts`.

### 15. Backend integration requirements

Mask contact details for Support Agents on the server. Add `GET /admin/users/{id}`.

### 16. Known limitations

No direct account actions (by design: they go through moderation). No moderation history per member yet.
