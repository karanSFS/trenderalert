# Shared Admin Components

### 1. Overview

Reusable building blocks for every admin module: directory tables, search and filters, row actions, confirmation and form dialogs, detail drawers, dashboard metric and chart cards, permission helpers, list-state and query helpers, formatters, and a demo audit trail. Modules in Phases 4-6 compose these instead of building their own.

### 2. Requirements

- Prompt sections 6, 9 and 22: shared UI components, skeleton loading, explicit loading, error and empty states, accessible dialogs.
- Prompt section 3, rule 8: preserve filters and pagination during navigation.
- Prompt sections 11-16: confirmation for sensitive operations, required reasons for enforcement actions, demo audit events, input validation.
- Prompt section 17: action-level role restrictions.

### 3. Routes and screens

Not applicable. These components have no route of their own. Phase 4 (dashboard) is the first consumer.

### 4. User interactions

| Component       | Interaction                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| `SearchInput`   | Commits 300ms after typing stops, on Enter, or immediately on clear                                            |
| `FilterBar`     | Select, multi-select and date-range filters; shows "N filters active" and "Reset filters"                      |
| `DataTable`     | Server-style pagination and sorting; clickable rows (mouse and Enter key)                                      |
| `RowActions`    | "More actions" menu; items the role cannot perform are hidden                                                  |
| `ConfirmDialog` | Lists consequences; optional required reason (min 10 characters); stays open with an error if the action fails |
| `FormModal`     | Validates fields; stays open with an error if saving fails; Enter submits                                      |
| `DetailDrawer`  | Side panel with header actions, skeleton, error with retry                                                     |
| `MetricCard`    | Optional link to the related page; change shown with arrow and text                                            |
| `ChartCard`     | Header controls slot; loading, error, empty and content states                                                 |

### 5. Components

| File                                  | Exports                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `components/ui/SearchInput.tsx`       | `SearchInput`                                                                             |
| `components/ui/FilterBar.tsx`         | `FilterBar`, `FilterDefinition`, `DateRangeValue`                                         |
| `components/ui/DataTable.tsx`         | `DataTable`, `DataTablePagination`                                                        |
| `components/ui/RowActions.tsx`        | `RowActions`, `RowActionItem`                                                             |
| `components/ui/ConfirmDialog.tsx`     | `ConfirmDialog`, `ReasonRequirement`                                                      |
| `components/ui/FormModal.tsx`         | `FormModal`                                                                               |
| `components/ui/DetailDrawer.tsx`      | `DetailDrawer`, `DetailSection`, `DetailList`, `DetailListItem`                           |
| `components/ui/DemoDataTag.tsx`       | `DemoDataTag`                                                                             |
| `components/ui/LoadingSkeleton.tsx`   | `TableSkeleton` gained a `bare` option                                                    |
| `components/dashboard/MetricCard.tsx` | `MetricCard`, `MetricChange`                                                              |
| `components/dashboard/ChartCard.tsx`  | `ChartCard`                                                                               |
| `components/auth/Can.tsx`             | `Can`                                                                                     |
| `features/auth/usePermission.ts`      | `usePermission`, `usePermissionChecker`                                                   |
| `styles/chartTheme.ts`                | `useChartTheme`, `ChartTheme`                                                             |
| `lib/hooks/useDelayedFlag.ts`         | `useDelayedFlag`                                                                          |
| `lib/formatters/date.ts`              | `formatDate`, `formatDateTime`, `formatRelativeDays`                                      |
| `lib/formatters/number.ts`            | `formatNumber`, `formatCompact`, `formatPercent`, `formatSignedPercent`, `formatCurrency` |
| `lib/errors.ts`                       | `getErrorMessage`                                                                         |

#### Usage

Directory page:

```tsx
<DataTable<User>
  ariaLabel="User directory"
  columns={columns} // sortable columns: `key` = sortField, `sorter: true`
  data={users}
  rowKey="id"
  status={list.status}
  error={list.error}
  onRetry={() => dispatch(fetchUsers())}
  pagination={{ page: list.query.page, pageSize: list.query.pageSize, total: list.total }}
  sort={list.query}
  onPageChange={(change) => dispatch(usersActions.setPage(change))}
  onSortChange={(change) => dispatch(usersActions.setSort(change))}
  onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
  toolbar={
    <FilterBar<UserFilters>
      search={{
        value: list.query.search,
        onSearch: (v) => dispatch(usersActions.setSearch(v)),
        ariaLabel: "Search users",
      }}
      filters={[{ type: "select", key: "status", label: "Status", options: STATUS_OPTIONS }]}
      values={list.query.filters}
      onFiltersChange={(change) => dispatch(usersActions.setFilters(change))}
      onReset={() => dispatch(usersActions.resetQuery())}
    />
  }
/>
```

Consequential action:

```tsx
<ConfirmDialog
  open={open}
  title="Suspend account"
  danger
  consequences={["The account cannot sign in", "Recorded in the demo audit log"]}
  requireReason
  confirmLabel="Suspend"
  onConfirm={async (reason) => {
    await dispatch(suspendUser({ id, reason })).unwrap(); // rejects keep the dialog open
    await dispatch(
      recordDemoAuditEvent({
        action: "user.suspend",
        targetType: "user",
        targetId: id,
        summary: `Suspended ${name}`,
        reason,
      }),
    );
  }}
  onClose={() => setOpen(false)}
/>
```

Metric:

```tsx
<MetricCard
  label="Pending moderation"
  value={formatNumber(42)}
  change={{ value: -0.08, label: "vs last week", higherIsBetter: false }}
  href="/admin/moderation"
/>
```

### 6. Redux state

- `src/store/listState.ts`: `ListState<TFilters>` (`query`, `ids`, `total`, `status`, `error`), `createListState`, `createListReducers` (`setSearch`, `setFilters`, `setSort`, `setPage`, `resetQuery`), `listLifecycle` (pending, fulfilled, rejected helpers) and `countActiveFilters`. Any change other than paging returns to page 1. `resetQuery` keeps the chosen page size.
- `audit` slice: `sessionEvents`, `recordStatus`, `recordError`. Thunk `recordDemoAuditEvent(draft)` fills actor from the signed-in demo admin. Reducer `clearSessionEvents`. Selector factory `makeSelectAuditEventsForTarget`.

### 7. Data model

`AuditEvent { id, occurredAt, actorId, actorName, actorRole, action, targetType, targetId, summary, reason?, demo: true }`, `AuditEventDraft`, `AuditTargetType` (`features/audit/auditTypes.ts`). `ListQueryOf<TFilters>` extends `ListQuery` with required `search` and `filters`.

### 8. Mock data

None added. `applyListQuery` operates on module datasets added in later phases.

### 9. Service layer

- `services/mock/query.ts`: `applyListQuery(items, query, { searchFields, filterPredicates, sortAccessors })` returns `PaginatedResult<T>`, clamping the page to the last available page.
- `AuditService.record(draft, actor)` (contract in `services/contracts/auditService.ts`, mock in `services/mock/auditService.ts`, registered in `services/index.ts`).

### 10. Loading and error handling

- `useDelayedFlag` (150ms) prevents skeleton flashes on fast responses in `DataTable`, `MetricCard` and `ChartCard`. Containers keep their minimum height during the delay.
- `DataTable`: first load uses a skeleton; refetch keeps rows with an overlay; failure without rows shows `ErrorState` with retry; failure with rows shows an inline alert above the previous results.
- Dialogs never show success for a failed action; they display the error from `getErrorMessage`.
- Regions use `aria-busy`; errors use `role="alert"`.

### 11. Permissions

`RowActions` items and `Can` blocks take a `Permission`. Items the role lacks are hidden. These are UI-only restrictions.

### 12. Business rules

- Required reasons default to a minimum of 10 characters, maximum 500.
- Dates format in `en-US` and `UTC` for deterministic, server-consistent output.
- Money formats from minor units (cents).
- Audit events are only recorded after a simulated mutation succeeds.

### 13. Testing

- `npm run lint`, `npm run typecheck`, `npm run build`.
- During development, a temporary type-check file exercised every component and a list slice built with `createListReducers`, and a runtime script checked `applyListQuery` (search, filter, sort, page clamping), the list reducers (page reset, reset keeps page size) and the formatters. Both scratch files were removed.
- Browser verification happens in Phase 4 when the dashboard consumes `MetricCard` and `ChartCard`, and in Phase 5 for the table and dialogs.

### 14. Files changed

See the table in section 5, plus `src/features/audit/*`, `src/services/{index.ts,contracts/auditService.ts,mock/auditService.ts,mock/query.ts}`, `src/store/{listState.ts,rootReducer.ts}`, `src/app/globals.css` (drawer max width), `package.json` (`dayjs`).

### 15. Backend integration requirements

- List endpoints should accept `search`, `page`, `pageSize`, `sortField`, `sortOrder` and filter parameters, and return `{ items, total, page, pageSize }` (proposed shape matching `PaginatedResult`).
- Audit records must be written by the backend as part of each action. The client `AuditService.record` exists only for the demo.

### 16. Known limitations

- No showcase page (owner choice). Components are verified in the browser as modules adopt them.
- No unit test runner yet.
- The header notification indicator is deferred to Phase 4.
- Audit session events reset on page refresh.
