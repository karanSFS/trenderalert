import type { ListQuery, PaginatedResult } from "@/types/api";
import type { EntityId } from "@/types/common";

/**
 * Read operations shared by every directory module. Proposed backend shape:
 * `GET /admin/{module}?search&page&pageSize&sortField&sortOrder&...filters` and
 * `GET /admin/{module}/{id}` (not final).
 */
export interface DirectoryService<T, TFilters> {
  list(query: ListQuery<TFilters>): Promise<PaginatedResult<T>>;
  get(id: EntityId): Promise<T>;
}

/** Identity of the admin performing a demo action, used for history and outcomes. */
export interface ActionActor {
  id: EntityId;
  name: string;
}
