import type { ListQuery, PaginatedResult } from "@/types/api";

type FilterValue<V> = Exclude<V, undefined | null>;

export interface ListQueryConfig<T, TFilters> {
  /** Text fields matched case-insensitively against `query.search`. */
  searchFields: (item: T) => Array<string | null | undefined>;
  /** One predicate per filter key. Empty values (undefined, null, "", []) are skipped. */
  filterPredicates?: {
    [K in keyof TFilters]?: (item: T, value: FilterValue<TFilters[K]>) => boolean;
  };
  /** Sort accessors keyed by the column's `sortField`. */
  sortAccessors?: Record<string, (item: T) => string | number | null | undefined>;
}

function isEmptyFilter(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function compareValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
) {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "en-US", { sensitivity: "base", numeric: true });
}

/**
 * Applies search, filters, sorting and pagination to a mock dataset, mirroring what a backend
 * list endpoint is expected to do. The requested page is clamped to the last available page.
 */
export function applyListQuery<T, TFilters>(
  items: readonly T[],
  query: ListQuery<TFilters>,
  config: ListQueryConfig<T, TFilters>,
): PaginatedResult<T> {
  const search = query.search?.trim().toLowerCase() ?? "";
  let result = search
    ? items.filter((item) =>
        config.searchFields(item).some((field) => field?.toLowerCase().includes(search)),
      )
    : [...items];

  if (query.filters && config.filterPredicates) {
    for (const key of Object.keys(config.filterPredicates) as (keyof TFilters)[]) {
      const value = query.filters[key];
      const predicate = config.filterPredicates[key];
      if (!predicate || isEmptyFilter(value)) continue;
      result = result.filter((item) => predicate(item, value as FilterValue<TFilters[typeof key]>));
    }
  }

  const accessor = query.sortField ? config.sortAccessors?.[query.sortField] : undefined;
  if (accessor && query.sortOrder) {
    const direction = query.sortOrder === "ascend" ? 1 : -1;
    result.sort((a, b) => direction * compareValues(accessor(a), accessor(b)));
  }

  const pageSize = Math.max(1, query.pageSize);
  const lastPage = Math.max(1, Math.ceil(result.length / pageSize));
  const page = Math.min(Math.max(1, query.page), lastPage);
  const start = (page - 1) * pageSize;

  return { items: result.slice(start, start + pageSize), total: result.length, page, pageSize };
}
