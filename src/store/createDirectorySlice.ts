import {
  createAsyncThunk,
  createSelector,
  createSlice,
  type Draft,
  type PayloadAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import type { AuthState } from "@/features/auth/authTypes";
import type { ActionActor, DirectoryService } from "@/services/contracts/directory";
import { MockServiceError, toServiceError } from "@/services/mock/mockDelay";
import type { AsyncStatus, PaginatedResult, ServiceError, SortOrder } from "@/types/api";
import type { EntityId } from "@/types/common";
import {
  createListReducers,
  createListState,
  listLifecycle,
  type ListQueryOf,
  type ListState,
  type PageChange,
  type SortChange,
} from "./listState";

export interface RequestState {
  status: AsyncStatus;
  error: ServiceError | null;
}

export interface DirectoryState<T, TFilters, TContext> {
  list: ListState<TFilters>;
  /** Every loaded record, stored once and shared by the list and detail views. */
  entities: Record<EntityId, T>;
  detail: RequestState & { id: EntityId | null };
  /** Related data for the record being viewed (history, linked records). */
  context: RequestState & { id: EntityId | null; data: TContext | null };
  mutation: RequestState & { action: string | null };
}

interface DirectoryConfig<T, TFilters, TContext> {
  name: string;
  service: DirectoryService<T, TFilters>;
  initialFilters: TFilters;
  list?: { pageSize?: number; sortField?: string; sortOrder?: SortOrder };
  getContext?: (id: EntityId) => Promise<TContext>;
}

type ThunkApi = { state: { auth: AuthState }; rejectValue: ServiceError };

const idle: RequestState = { status: "idle", error: null };

/**
 * Builds the standard slice for a directory module: list query and results, an entity map,
 * detail and context loading, and shared mutation status. Modules add action thunks with
 * `createMutation`; each must resolve to the updated record, which is upserted automatically.
 */
export function createDirectorySlice<T extends { id: EntityId }, TFilters, TContext = never>(
  config: DirectoryConfig<T, TFilters, TContext>,
) {
  type State = DirectoryState<T, TFilters, TContext>;
  const { name, service } = config;
  const initialList = createListState<TFilters>(config.initialFilters, config.list);

  const initialState: State = {
    list: initialList,
    entities: {},
    detail: { ...idle, id: null },
    context: { ...idle, id: null, data: null },
    mutation: { ...idle, action: null },
  };

  const fetchList = createAsyncThunk<
    PaginatedResult<T>,
    ListQueryOf<TFilters>,
    { rejectValue: ServiceError }
  >(`${name}/fetchList`, async (query, { rejectWithValue }) => {
    try {
      return await service.list(query);
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  });

  const fetchOne = createAsyncThunk<T, EntityId, { rejectValue: ServiceError }>(
    `${name}/fetchOne`,
    async (id, { rejectWithValue }) => {
      try {
        return await service.get(id);
      } catch (error) {
        return rejectWithValue(toServiceError(error));
      }
    },
  );

  const fetchContext = createAsyncThunk<TContext, EntityId, { rejectValue: ServiceError }>(
    `${name}/fetchContext`,
    async (id, { rejectWithValue }) => {
      try {
        if (!config.getContext)
          throw new MockServiceError("UNKNOWN", "No related data for this module.");
        return await config.getContext(id);
      } catch (error) {
        return rejectWithValue(toServiceError(error));
      }
    },
  );

  const mutationPrefix = `${name}/mutate/`;

  /** Defines an action thunk. The signed-in demo admin is passed to the service as actor. */
  function createMutation<TArg>(key: string, run: (arg: TArg, actor: ActionActor) => Promise<T>) {
    return createAsyncThunk<T, TArg, ThunkApi>(
      `${mutationPrefix}${key}`,
      async (arg, { getState, rejectWithValue }) => {
        try {
          const admin = getState().auth.currentAdmin;
          if (!admin)
            throw new MockServiceError("FORBIDDEN", "Sign in to the demo to perform actions.");
          return await run(arg, { id: admin.id, name: admin.displayName });
        } catch (error) {
          return rejectWithValue(toServiceError(error));
        }
      },
    );
  }

  const isMutation = (suffix: string) => (action: UnknownAction) =>
    action.type.startsWith(mutationPrefix) && action.type.endsWith(suffix);

  const listReducers = createListReducers<TFilters, State>(initialList.query);
  // Immer drafts of a generic state cannot be related to State by the compiler.
  const asState = (draft: Draft<State>) => draft as unknown as State;

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setSearch: (state, action: PayloadAction<string>) =>
        listReducers.setSearch(asState(state), action),
      setFilters: (state, action: PayloadAction<Partial<TFilters>>) =>
        listReducers.setFilters(asState(state), action),
      setSort: (state, action: PayloadAction<SortChange>) =>
        listReducers.setSort(asState(state), action),
      setPage: (state, action: PayloadAction<PageChange>) =>
        listReducers.setPage(asState(state), action),
      resetQuery: (state) => listReducers.resetQuery(asState(state)),
      clearMutationError(state) {
        state.mutation.error = null;
        state.mutation.status = "idle";
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchList.pending, (state, action) => {
          listLifecycle.pending(asState(state).list);
          state.list.requestId = action.meta.requestId;
        })
        .addCase(fetchList.fulfilled, (state, action) => {
          if (state.list.requestId !== action.meta.requestId) return;
          for (const item of action.payload.items) asState(state).entities[item.id] = item;
          listLifecycle.fulfilled(asState(state).list, {
            ids: action.payload.items.map((item) => item.id),
            total: action.payload.total,
            page: action.payload.page,
          });
        })
        .addCase(fetchList.rejected, (state, action) => {
          if (state.list.requestId !== action.meta.requestId) return;
          listLifecycle.rejected(asState(state).list, action.payload);
        })
        .addCase(fetchOne.pending, (state, action) => {
          state.detail = { status: "loading", error: null, id: action.meta.arg };
        })
        .addCase(fetchOne.fulfilled, (state, action) => {
          if (state.detail.id !== action.meta.arg) return;
          asState(state).entities[action.payload.id] = action.payload;
          state.detail.status = "succeeded";
        })
        .addCase(fetchOne.rejected, (state, action) => {
          if (state.detail.id !== action.meta.arg) return;
          state.detail.status = "failed";
          state.detail.error = action.payload ?? {
            code: "UNKNOWN",
            message: "The record could not be loaded.",
          };
        })
        .addCase(fetchContext.pending, (state, action) => {
          state.context = { status: "loading", error: null, id: action.meta.arg, data: null };
        })
        .addCase(fetchContext.fulfilled, (state, action) => {
          if (state.context.id !== action.meta.arg) return;
          state.context.status = "succeeded";
          asState(state).context.data = action.payload;
        })
        .addCase(fetchContext.rejected, (state, action) => {
          if (state.context.id !== action.meta.arg) return;
          state.context.status = "failed";
          state.context.error = action.payload ?? {
            code: "UNKNOWN",
            message: "Related data could not be loaded.",
          };
        })
        .addMatcher(isMutation("/pending"), (state, action) => {
          state.mutation = {
            status: "loading",
            error: null,
            action: action.type.slice(mutationPrefix.length, -"/pending".length),
          };
        })
        .addMatcher(isMutation("/fulfilled"), (state, action: PayloadAction<T>) => {
          asState(state).entities[action.payload.id] = action.payload;
          state.mutation.status = "succeeded";
        })
        .addMatcher(
          isMutation("/rejected"),
          (state, action: PayloadAction<ServiceError | undefined>) => {
            state.mutation.status = "failed";
            state.mutation.error = action.payload ?? {
              code: "UNKNOWN",
              message: "The action could not be completed.",
            };
          },
        );
    },
  });

  /** Selector factory; pass the function that picks this module's state from the root. */
  function makeSelectors<RootState>(selectState: (root: RootState) => State) {
    const selectList = (root: RootState) => selectState(root).list;
    const selectEntities = (root: RootState) => selectState(root).entities;
    return {
      selectState,
      selectList,
      selectListItems: createSelector([selectList, selectEntities], (list, entities) =>
        list.ids.map((id) => entities[id]).filter((item): item is T => Boolean(item)),
      ),
      selectById: (root: RootState, id: EntityId | null | undefined) =>
        id ? selectEntities(root)[id] : undefined,
      selectDetail: (root: RootState) => selectState(root).detail,
      selectContext: (root: RootState) => selectState(root).context,
      selectMutation: (root: RootState) => selectState(root).mutation,
    };
  }

  return {
    slice,
    reducer: slice.reducer,
    actions: slice.actions,
    fetchList,
    fetchOne,
    fetchContext,
    createMutation,
    makeSelectors,
  };
}
