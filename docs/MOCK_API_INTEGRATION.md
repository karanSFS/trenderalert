# Mock API Integration

## How mock services work

```
Component -> thunk -> services/index.ts -> services/mock/<x>Service.ts -> mockRequest() -> data/mock/<x>.ts
```

- `src/services/contracts/` holds TypeScript interfaces for each service (for example `AuthService`).
- `src/services/mock/` implements those interfaces with mock data.
- `src/services/index.ts` is the registry that thunks import from. It currently exports the mock implementations.

## Simulated latency and failures

All simulation is centralized in `mockRequest()` (`src/services/mock/mockDelay.ts`). No page or component uses its own `setTimeout`.

```ts
mockRequest(() => DEMO_ADMIN_ACCOUNTS, { service: "auth" });
```

`mockRequest` waits for the configured delay, may throw a simulated failure, then returns a deep clone of the resolver's result.

| Variable                         | Default | Effect                                                               |
| -------------------------------- | ------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_MOCK_DELAY_MS`      | `450`   | Delay for every mock request                                         |
| `NEXT_PUBLIC_MOCK_FAILURE_RATE`  | `0`     | Probability (0-1) that any request fails                             |
| `NEXT_PUBLIC_MOCK_FAIL_SERVICES` | empty   | Comma-separated service keys that always fail, e.g. `auth,dashboard` |

Copy `.env.example` to `.env.local` and restart the dev server after changing values.

## Error handling

- Services throw `MockServiceError(code, message)`.
- Thunks use `rejectWithValue(toServiceError(error))`, so slices always receive a serializable `ServiceError`.
- Components render `ErrorState` with a retry that dispatches the thunk again. Failed operations never fabricate success.

## Replacing mock services with real APIs

1. Implement the contract, for example `services/api/authService.ts implements AuthService`, using `fetch` against the real endpoint.
2. Validate responses at the boundary before returning typed data.
3. Map HTTP and network failures to `ServiceError` codes (`NOT_FOUND`, `VALIDATION`, `FORBIDDEN`, `CONFLICT`, `UNAVAILABLE`, `UNKNOWN`).
4. Switch the export in `services/index.ts`. Slices and components stay unchanged.

## Contracts

### AuthService (Phase 1)

| Method                          | Returns              | Notes                                                                |
| ------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `listDemoAccounts()`            | `DemoAdminAccount[]` | Demo only. Removed in production                                     |
| `signInDemo(accountId)`         | `DemoAdminAccount`   | Demo only. Production replaces it with a real credential or SSO flow |
| `getDemoAccountForRole(role)`   | `DemoAdminAccount`   | Demo role switcher only                                              |
| `restoreDemoSession(accountId)` | `DemoAdminAccount`   | Production would validate a server session instead                   |

### DashboardService (Phase 4)

| Method              | Returns            | Service key     | Notes                                                                                                                                                              |
| ------------------- | ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getSummary(range)` | `DashboardSummary` | `dashboard`     | `range` is `7d`, `30d` or `90d`. KPIs include the previous-period value. Proposed endpoint: `GET /admin/dashboard/summary?range=…`, filtered by role on the server |
| `getAlerts()`       | `DashboardAlert[]` | `notifications` | The demo returns every alert and the UI filters by `permission`. A real endpoint should return only the caller's alerts with read state                            |

### AuditService (Phase 3)

| Method                 | Returns      | Notes                                                                                                                                                     |
| ---------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `record(draft, actor)` | `AuditEvent` | Demo only. The mock generates the id and timestamp. In production the backend writes audit records as part of each action, and the client only reads them |

### List queries (Phase 3)

Mock list services use `applyListQuery(items, query, config)` from `src/services/mock/query.ts`:

```ts
applyListQuery(USERS, query, {
  searchFields: (user) => [user.username, user.displayName, user.email],
  filterPredicates: {
    status: (user, value) => user.status === value,
    subscription: (user, values) => values.includes(user.subscription),
  },
  sortAccessors: { createdAt: (user) => user.createdAt, username: (user) => user.username },
});
```

Empty filter values (`undefined`, `null`, `""`, `[]`) are ignored. The requested page is clamped to the last page. The result is `PaginatedResult<T>` (`items`, `total`, `page`, `pageSize`), which is the **proposed** response shape for real list endpoints.

Proposed production endpoints are **not defined**. Final URLs, authentication scheme and response formats must come from the backend team. Anything in this document that resembles an endpoint is a proposal.

## Authentication integration points

- `services/index.ts`: swap `authService`.
- `features/auth/authSlice.ts`: thunks already handle loading, success and failure.
- `store/persistence.ts`: remove `ta.demoSession` persistence once server sessions exist.
- `components/layout/AdminLayout.tsx`: the session guard reads `sessionRestored` and `currentAdmin`. A server session check would set the same state.
