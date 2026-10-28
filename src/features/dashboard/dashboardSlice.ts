import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { dashboardService } from "@/services";
import { toServiceError } from "@/services/mock/mockDelay";
import type { ServiceError } from "@/types/api";
import type { DashboardRange, DashboardState, DashboardSummary } from "./dashboardTypes";

const initialState: DashboardState = {
  range: "30d",
  summary: null,
  status: "idle",
  error: null,
  lastLoadedAt: null,
  latestRequestId: null,
};

export const fetchDashboard = createAsyncThunk<
  DashboardSummary,
  DashboardRange,
  { rejectValue: ServiceError }
>("dashboard/fetch", async (range, { rejectWithValue }) => {
  try {
    return await dashboardService.getSummary(range);
  } catch (error) {
    return rejectWithValue(toServiceError(error));
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardRange(state, action: PayloadAction<DashboardRange>) {
      state.range = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.summary = action.payload;
        state.lastLoadedAt = new Date().toISOString();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload ?? {
          code: "UNKNOWN",
          message: "The dashboard could not be loaded.",
        };
      });
  },
});

export const { setDashboardRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
