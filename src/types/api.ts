export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export type ServiceErrorCode =
  "NOT_FOUND" | "VALIDATION" | "FORBIDDEN" | "CONFLICT" | "UNAVAILABLE" | "UNKNOWN";

/** Serializable error shape stored in Redux and returned by every service. */
export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
}

export type SortOrder = "ascend" | "descend";

export interface ListQuery<TFilters = Record<string, unknown>> {
  search?: string;
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: SortOrder;
  filters?: TFilters;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
