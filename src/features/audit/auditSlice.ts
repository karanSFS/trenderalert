import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { auditService } from "@/services";
import { MockServiceError, toServiceError } from "@/services/mock/mockDelay";
import type { ServiceError } from "@/types/api";
import type { AuthState } from "@/features/auth/authTypes";
import type { AuditEvent, AuditEventDraft, AuditState } from "./auditTypes";

const initialState: AuditState = {
  sessionEvents: [],
  recordStatus: "idle",
  recordError: null,
};

/**
 * Records a demo audit event for the signed-in demo admin. Dispatch after a simulated
 * mutation succeeds; never for a failed one.
 */
export const recordDemoAuditEvent = createAsyncThunk<
  AuditEvent,
  AuditEventDraft,
  { state: { auth: AuthState }; rejectValue: ServiceError }
>("audit/recordDemoAuditEvent", async (draft, { getState, rejectWithValue }) => {
  try {
    const actor = getState().auth.currentAdmin;
    if (!actor) throw new MockServiceError("FORBIDDEN", "Sign in to the demo to record actions.");
    return await auditService.record(draft, actor);
  } catch (error) {
    return rejectWithValue(toServiceError(error));
  }
});

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    clearSessionEvents(state) {
      state.sessionEvents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(recordDemoAuditEvent.pending, (state) => {
        state.recordStatus = "loading";
        state.recordError = null;
      })
      .addCase(recordDemoAuditEvent.fulfilled, (state, action) => {
        state.recordStatus = "succeeded";
        state.sessionEvents.unshift(action.payload);
      })
      .addCase(recordDemoAuditEvent.rejected, (state, action) => {
        state.recordStatus = "failed";
        state.recordError = action.payload ?? {
          code: "UNKNOWN",
          message: "The audit event was not recorded.",
        };
      });
  },
});

export const { clearSessionEvents } = auditSlice.actions;
export default auditSlice.reducer;
