# Redux State Management

## Store configuration

- `src/store/index.ts`: `makeStore()` with `configureStore`, the root reducer and the persistence listener middleware. Exports `AppStore`, `RootState`, `AppDispatch`.
- `src/store/rootReducer.ts`: combines slices.
- `src/store/hooks.ts`: typed `useAppDispatch`, `useAppSelector`, `useAppStore`.
- `src/providers/StoreProvider.tsx`: creates the store once per session and restores saved state after mount.

## Slices

| Key      | File                               | State                                                                                                                                    |
| -------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `auth`   | `features/auth/authSlice.ts`       | Current demo admin, session restored flag, sign-in status and error, role-switch status, demo account list with its own status and error |
| `theme`  | `features/settings/themeSlice.ts`  | Preset, mode, restored flag                                                                                                              |
| `layout` | `features/settings/layoutSlice.ts` | Sidebar collapsed                                                                                                                        |
| `audit`  | `features/audit/auditSlice.ts`     | Demo audit events recorded this session (newest first), record status and error                                                          |

Module slices (users, moderation, finance and so on) are added in later phases, one per domain. There is no single application-wide slice.

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

## Demo audit events

After a simulated mutation succeeds, dispatch `recordDemoAuditEvent({ action, targetType, targetId, summary, reason })`. The thunk adds the signed-in demo admin as actor. Never record an event for a failed action. Use `makeSelectAuditEventsForTarget()` to show a record's recent demo history.

## Async actions

Async work uses `createAsyncThunk` and calls the service registry (`src/services/index.ts`), never mock data directly.

```ts
export const signInDemo = createAsyncThunk<DemoAdminAccount, string, { rejectValue: ServiceError }>(
  "auth/signInDemo",
  async (accountId, { rejectWithValue }) => {
    try {
      return await authService.signInDemo(accountId);
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
);
```

Auth thunks: `fetchDemoAccounts`, `signInDemo`, `switchDemoRole`, `restoreDemoSession`.

## Loading and error states

Every async operation tracks an explicit `AsyncStatus`: `idle`, `loading`, `succeeded`, `failed`. Errors are stored separately from data as `ServiceError { code, message }`. Components choose between skeleton, error with retry, empty and content based on these fields.

## Selectors

Selectors live in `<domain>Selectors.ts` (for example `selectCurrentAdmin`, `selectCurrentRole`, `selectHasPermission`, `selectThemePreference`). Components read state only through selectors.

## Persistence

`src/store/persistence.ts` uses RTK `createListenerMiddleware`:

| Actions                        | Saved to `localStorage`                           |
| ------------------------------ | ------------------------------------------------- |
| theme changes                  | `ta.theme` `{ preset, mode }`                     |
| sidebar toggle                 | `ta.layout` `{ sidebarCollapsed }`                |
| sign in, role switch, sign out | `ta.demoSession` `{ accountId }` (no credentials) |

Restoration happens once in `StoreProvider` after mount, so server and client renders always start from the same initial state.

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
