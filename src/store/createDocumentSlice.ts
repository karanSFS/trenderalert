import {
  createAsyncThunk,
  createSlice,
  type Draft,
  type PayloadAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import type { AuthState } from "@/features/auth/authTypes";
import type { ActionActor } from "@/services/contracts/directory";
import { MockServiceError, toServiceError } from "@/services/mock/mockDelay";
import type { AsyncStatus, ServiceError } from "@/types/api";

export interface DocumentState<T> {
  data: T | null;
  status: AsyncStatus;
  error: ServiceError | null;
  save: { status: AsyncStatus; error: ServiceError | null; action: string | null };
}

interface DocumentConfig<T, TArg> {
  name: string;
  fetch: (arg: TArg) => Promise<T>;
}

type ThunkApi = { state: { auth: AuthState }; rejectValue: ServiceError };

/**
 * Slice for a module backed by one document (a configuration or snapshot) rather than a
 * paginated list. Saves resolve to the full updated document, which replaces `data`.
 */
export function createDocumentSlice<T, TArg = void>(config: DocumentConfig<T, TArg>) {
  const { name } = config;
  const initialState: DocumentState<T> = {
    data: null,
    status: "idle",
    error: null,
    save: { status: "idle", error: null, action: null },
  };

  const fetchDocument = createAsyncThunk<T, TArg, { rejectValue: ServiceError }>(
    `${name}/fetch`,
    async (arg, { rejectWithValue }) => {
      try {
        return await config.fetch(arg);
      } catch (error) {
        return rejectWithValue(toServiceError(error));
      }
    },
  );

  const savePrefix = `${name}/save/`;

  function createSave<TSaveArg>(
    key: string,
    run: (arg: TSaveArg, actor: ActionActor) => Promise<T>,
  ) {
    return createAsyncThunk<T, TSaveArg, ThunkApi>(
      `${savePrefix}${key}`,
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

  const isSave = (suffix: string) => (action: UnknownAction) =>
    action.type.startsWith(savePrefix) && action.type.endsWith(suffix);

  // Immer drafts of a generic state cannot be related to the state type by the compiler.
  const asState = (draft: Draft<DocumentState<T>>) => draft as unknown as DocumentState<T>;

  const slice = createSlice({
    name,
    initialState,
    reducers: {
      clearSaveError(state) {
        state.save = { status: "idle", error: null, action: null };
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchDocument.pending, (state) => {
          state.status = "loading";
          state.error = null;
        })
        .addCase(fetchDocument.fulfilled, (state, action) => {
          state.status = "succeeded";
          asState(state).data = action.payload;
        })
        .addCase(fetchDocument.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? {
            code: "UNKNOWN",
            message: "The data could not be loaded.",
          };
        })
        .addMatcher(isSave("/pending"), (state, action) => {
          state.save = {
            status: "loading",
            error: null,
            action: action.type.slice(savePrefix.length, -"/pending".length),
          };
        })
        .addMatcher(isSave("/fulfilled"), (state, action: PayloadAction<T>) => {
          asState(state).data = action.payload;
          state.save.status = "succeeded";
        })
        .addMatcher(
          isSave("/rejected"),
          (state, action: PayloadAction<ServiceError | undefined>) => {
            state.save.status = "failed";
            state.save.error = action.payload ?? {
              code: "UNKNOWN",
              message: "The change could not be saved.",
            };
          },
        );
    },
  });

  return { slice, reducer: slice.reducer, actions: slice.actions, fetchDocument, createSave };
}
