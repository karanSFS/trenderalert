"use client";

import type { AsyncThunk } from "@reduxjs/toolkit";
import { useCallback, useEffect } from "react";
import type { ListQueryOf, ListState, PageChange, SortChange } from "@/store/listState";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import type { PaginatedResult, ServiceError } from "@/types/api";

interface ListActions<TFilters> {
  setSearch: (value: string) => { type: string; payload: string };
  setFilters: (change: Partial<TFilters>) => { type: string; payload: Partial<TFilters> };
  setSort: (change: SortChange) => { type: string; payload: SortChange };
  setPage: (change: PageChange) => { type: string; payload: PageChange };
  resetQuery: () => { type: string };
}

interface DirectorySelectors<T, TFilters> {
  selectList: (state: RootState) => ListState<TFilters>;
  selectListItems: (state: RootState) => T[];
}

type FetchList<T, TFilters> = AsyncThunk<
  PaginatedResult<T>,
  ListQueryOf<TFilters>,
  { rejectValue: ServiceError }
>;

/**
 * Loads a module list whenever its query changes and returns ready-made props for
 * `FilterBar` and `DataTable`.
 */
export function useDirectoryList<T, TFilters extends object>(
  selectors: DirectorySelectors<T, TFilters>,
  fetchList: FetchList<T, TFilters>,
  actions: ListActions<TFilters>,
) {
  const dispatch = useAppDispatch();
  const list = useAppSelector(selectors.selectList);
  const items = useAppSelector(selectors.selectListItems);
  const { query } = list;

  useEffect(() => {
    dispatch(fetchList(query));
  }, [dispatch, fetchList, query]);

  const refetch = useCallback(() => dispatch(fetchList(query)), [dispatch, fetchList, query]);

  return {
    list,
    items,
    refetch,
    search: {
      value: query.search,
      onSearch: (value: string) => dispatch(actions.setSearch(value)),
    },
    filterBar: {
      values: query.filters,
      onFiltersChange: (change: Partial<TFilters>) => dispatch(actions.setFilters(change)),
      onReset: () => dispatch(actions.resetQuery()),
    },
    table: {
      data: items,
      status: list.status,
      error: list.error,
      onRetry: refetch,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: list.total,
        totalExact: list.totalExact,
      },
      sort: { sortField: query.sortField, sortOrder: query.sortOrder },
      onPageChange: (change: PageChange) => dispatch(actions.setPage(change)),
      onSortChange: (change: SortChange) => dispatch(actions.setSort(change)),
    },
  };
}
