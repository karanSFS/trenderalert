# Redux State Management

## Store configuration

- `src/store/index.ts`: `makeStore()` with `configureStore`, the root reducer and the persistence listener middleware. Exports `AppStore`, `RootState`, `AppDispatch`.
- `src/store/rootReducer.ts`: combines slices.
- `src/store/hooks.ts`: typed `useAppDispatch`, `useAppSelector`, `useAppStore`.
- `src/providers/StoreProvider.tsx`: creates the store once per session and restores saved state after mount.

## Slices

| Key             | File                                           | State                                                                                                                 |
| --------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `auth`          | `features/auth/authSlice.ts`                   | Signed-in admin identity (no tokens), session restored flag, session error, sign-in status and error, sign-out status |
| `theme`         | `features/settings/themeSlice.ts`              | Preset, mode, restored flag                                                                                           |
| `layout`        | `features/settings/layoutSlice.ts`             | Sidebar collapsed                                                                                                     |
| `audit`         | `features/audit/auditSlice.ts`                 | Demo audit events recorded this session (newest first), record status and error                                       |
| `dashboard`     | `features/dashboard/dashboardSlice.ts`         | Selected range, summary, status, error, last loaded time, latest request id (older responses are ignored)             |
| `notifications` | `features/notifications/notificationsSlice.ts` | Alerts, status, error, ids read this session                                                                          |

Module slices, one per domain (there is no single application-wide slice):

| Key                                                                                                | Built with             | Phase |
| -------------------------------------------------------------------------------------------------- | ---------------------- | ----- |
| `users`, `content`, `trends`, `moderation`, `appeals`, `copyright`                                 | `createDirectorySlice` | 5     |
| `contests`, `subscriptions`, `transactions`, `reconciliation`, `support`, `adminUsers`, `auditLog` | `createDirectorySlice` | 6     |
| `discovery`, `configuration`, `operations`, `financeOverview`                                      | `createDocumentSlice`  | 6     |

### Backend-connected slices (2026-10-29)

| Key                                                                                                | Built with                                                    | Source                              |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `users`, `trends`, `moderation`, `appeals`, `adminRoles`, `auditLog`                               | `createDirectorySlice`                                        | Backend services in `services/api/` |
| `platformMetrics`, `platformHealth`, `featureFlags`, `supportLookup`, `openReports`, `recentAudit` | `createDocumentSlice` (`features/platform/platformSlices.ts`) | Backend services                    |

List state carries `totalExact`: false when the backend gives no total, so the table footer shows the visible range instead of "of N".

## List state pattern

Directory screens keep their query in Redux so search, filters, sorting and pagination survive navigating to a detail page and back. Use `src/store/listState.ts`:

```ts
interface UsersState {
  list: ListState<UserFilters>;
  entities: Record<string, User>;
}

const initialList = createListState<UserFilters>({ status: undefined, subscription: [] });

const usersSlice = createSlice({
  name: "users",
  initialState: { list: initialList, entities: {} } as UsersState,
  reducers: {
    ...createListReducers<UserFilters, UsersState>(initialList.query),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => listLifecycle.pending(state.list))
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        payload.items.forEach((user) => (state.entities[user.id] = user));
        listLifecycle.fulfilled(state.list, {
          ids: payload.items.map((u) => u.id),
          total: payload.total,
          page: payload.page,
        });
      })
      .addCase(fetchUsers.rejected, (state, { payload }) =>
        listLifecycle.rejected(state.list, payload),
      );
  },
});
```

- `setSearch`, `setFilters`, `setSort` return to page 1. `setPage` changes page, or resets to page 1 when the page size changes. `resetQuery` restores defaults but keeps the page size.
- The list stores `ids`; records live once in `entities`, so detail views and lists share the same data.
- Pages dispatch the fetch thunk whenever `list.query` changes.

## Directory slice factory (Phase 5)

`src/store/createDirectorySlice.ts` builds every module slice with the same shape:

| Key        | Contents                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------- |
| `list`     | `ListState`: query, ids, total, status, error, `requestId` (older responses are ignored) |
| `entities` | Every loaded record by id (shared by list, drawer and detail page)                       |
| `detail`   | `{ id, status, error }` for the record being viewed                                      |
| `context`  | `{ id, status, error, data }` for related data (history, linked records)                 |
| `mutation` | `{ status, error, action }` for the latest action                                        |

It returns `fetchList(query)`, `fetchOne(id)`, `fetchContext(id)`, `createMutation(key, run)` and `makeSelectors(selectState)`. Every mutation resolves to the updated record, which is upserted automatically. The signed-in demo admin is passed to the service as the actor.

```ts
export const usersModule = createDirectorySlice<PlatformUser, UserFilters, UserActivity>({
  name: "users",
  service: usersService,
  initialFilters: { status: undefined, plan: undefined, verification: undefined },
  list: { sortField: "registeredAt", sortOrder: "descend" },
  getContext: (id) => usersService.getActivity(id),
});

export const enforceUser = usersModule.createMutation<{
  id: string;
  action: UserEnforcementAction;
  reason: string;
}>("enforce", ({ id, action, reason }, actor) => usersService.enforce(id, action, reason, actor));
```

## Document slice factory (Phase 6)

`src/store/createDocumentSlice.ts` serves modules backed by one document (a configuration or snapshot) instead of a paginated list. State is `{ data, status, error, save: { status, error, action } }`. It returns `fetchDocument(arg)` and `createSave(key, run)`; every save resolves to the full updated document, which replaces `data`.

```ts
export const configurationModule = createDocumentSlice<ConfigurationData>({
  name: "configuration",
  fetch: () => configurationService.get(),
});

export const updateFeatureFlag = configurationModule.createSave<{
  key: string;
  enabled: boolean;
  rollout: number;
  reason: string;
}>("flag", ({ key, enabled, rollout, reason }, actor) =>
  configurationService.updateFlag(key, { enabled, rollout }, reason, actor),
);
```

The configuration page and the feature-flags page share the `configuration` slice. `financeOverview` takes the period in days as its fetch argument.

Typed selectors for all modules are in `src/features/moduleSelectors.ts` (directory selectors plus `selectDiscovery`, `selectConfiguration`, `selectOperations`, `selectFinanceOverview`). Screens use `useDirectoryList(selectors, fetchList, actions)` (fetches on query change and returns `FilterBar` and `DataTable` props) and `useDemoAction()` (success message, audit event, follow-up refetch).

## Demo audit events

After a simulated mutation succeeds, dispatch `recordDemoAuditEvent({ action, targetType, targetId, summary, reason })`. The thunk adds the signed-in demo admin as actor. Never record an event for a failed action. Use `makeSelectAuditEventsForTarget()` to show a record's recent demo history. Since Phase 6 the mock audit service also appends each event to the demo database, so the Audit logs page lists it.

Small reference lists that are not module state (support agents for the assignee filter, administrators for the audit actor filter) are loaded with `useLookup(key, loader)`, which caches one request per page load.

## Async actions

Async work uses `createAsyncThunk` and calls the service registry (`src/services/index.ts`), never mock data directly.

```ts
export const signIn = createAsyncThunk<
  AdminIdentity,
  SignInCredentials,
  { rejectValue: ServiceError }
>("auth/signIn", async (credentials, { rejectWithValue }) => {
  try {
    return await authService.signIn(credentials);
  } catch (error) {
    return rejectWithValue(toServiceError(error));
  }
});
```

Auth thunks: `signIn`, `restoreSession`, `signOut` (always clears the local session).

## Loading and error states

Every async operation tracks an explicit `AsyncStatus`: `idle`, `loading`, `succeeded`, `failed`. Errors are stored separately from data as `ServiceError { code, message }`. Components choose between skeleton, error with retry, empty and content based on these fields.

## Selectors

Selectors live in `<domain>Selectors.ts` (for example `selectCurrentAdmin`, `selectCurrentRole`, `selectHasPermission`, `selectThemePreference`). Components read state only through selectors.

## Persistence

`src/store/persistence.ts` uses RTK `createListenerMiddleware`:

| Actions        | Saved to `localStorage`            |
| -------------- | ---------------------------------- |
| theme changes  | `ta.theme` `{ preset, mode }`      |
| sidebar toggle | `ta.layout` `{ sidebarCollapsed }` |

The admin session is not stored in `localStorage`; it lives in httpOnly cookies and is checked with `restoreSession()`. Restoration happens once in `StoreProvider` after mount, so server and client renders always start from the same initial state.

## Redux or local state?

Use Redux for:

- Data loaded through services, and its status and error.
- State shared across routes or components (session, theme, list filters and pagination that should survive navigation).
- Results of demo mutations that other screens must reflect (for example audit events).

Use local component state for:

- Modal and drawer visibility, popover open state.
- Uncommitted form input before validation and submit.
- Purely visual, short-lived UI state.

Avoid storing the same records in more than one slice. Derive views with selectors instead.
