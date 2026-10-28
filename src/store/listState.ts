import type { PayloadAction } from "@reduxjs/toolkit";
import type { AsyncStatus, ListQuery, ServiceError, SortOrder } from "@/types/api";
import type { EntityId } from "@/types/common";

/** Query whose filters are always present, so reducers and UI never handle `undefined`. */
export type ListQueryOf<TFilters> = ListQuery<TFilters> & { filters: TFilters; search: string };

/**
 * Standard list state for directory screens. The query lives in Redux so search, filters,
 * sorting and pagination survive navigating to a detail page and back.
 */
export interface ListState<TFilters> {
  query: ListQueryOf<TFilters>;
  ids: EntityId[];
  total: number;
  status: AsyncStatus;
  error: ServiceError | null;
  /** Id of the newest list request; responses from older requests are ignored. */
  requestId: string | null;
}

export const DEFAULT_PAGE_SIZE = 10;

export function createListState<TFilters>(
  filters: TFilters,
  options: { pageSize?: number; sortField?: string; sortOrder?: SortOrder } = {},
): ListState<TFilters> {
  return {
    query: {
      search: "",
      page: 1,
      pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
      sortField: options.sortField,
      sortOrder: options.sortOrder,
      filters,
    },
    ids: [],
    total: 0,
    status: "idle",
    error: null,
    requestId: null,
  };
}

export interface SortChange {
  sortField?: string;
  sortOrder?: SortOrder;
}

export interface PageChange {
  page: number;
  pageSize?: number;
}

/**
 * Case reducers for a slice that keeps its list under `state.list`. Spread the result into
 * `createSlice({ reducers })`. Any change other than paging returns to page 1.
 */
export function createListReducers<TFilters, TState extends { list: ListState<TFilters> }>(
  initialQuery: ListQueryOf<TFilters>,
) {
  const defaults = structuredClone(initialQuery);
  return {
    setSearch(state: TState, action: PayloadAction<string>) {
      state.list.query.search = action.payload;
      state.list.query.page = 1;
    },
    setFilters(state: TState, action: PayloadAction<Partial<TFilters>>) {
      state.list.query.filters = { ...state.list.query.filters, ...action.payload };
      state.list.query.page = 1;
    },
    setSort(state: TState, action: PayloadAction<SortChange>) {
      state.list.query.sortField = action.payload.sortOrder ? action.payload.sortField : undefined;
      state.list.query.sortOrder = action.payload.sortOrder;
      state.list.query.page = 1;
    },
    setPage(state: TState, action: PayloadAction<PageChange>) {
      const { page, pageSize } = action.payload;
      if (pageSize && pageSize !== state.list.query.pageSize) {
        state.list.query.pageSize = pageSize;
        state.list.query.page = 1;
      } else {
        state.list.query.page = page;
      }
    },
    resetQuery(state: TState) {
      state.list.query = { ...structuredClone(defaults), pageSize: state.list.query.pageSize };
    },
  };
}

/** Helpers for the pending, fulfilled and rejected cases of a list thunk. */
export const listLifecycle = {
  pending<TFilters>(list: ListState<TFilters>) {
    list.status = "loading";
    list.error = null;
  },
  fulfilled<TFilters>(
    list: ListState<TFilters>,
    result: { ids: EntityId[]; total: number; page: number },
  ) {
    list.status = "succeeded";
    list.ids = result.ids;
    list.total = result.total;
    list.query.page = result.page;
  },
  rejected<TFilters>(list: ListState<TFilters>, error: ServiceError | undefined) {
    list.status = "failed";
    list.error = error ?? { code: "UNKNOWN", message: "The list could not be loaded." };
  },
};

/**
 * Number of filters with a non-empty value, for the "N filters active" indicator. Boolean
 * toggles are excluded because they are shown as their own control.
 */
export function countActiveFilters(filters: object): number {
  return Object.values(filters).filter((value) =>
    Array.isArray(value)
      ? value.length > 0
      : typeof value !== "boolean" && value !== undefined && value !== null && value !== "",
  ).length;
}
