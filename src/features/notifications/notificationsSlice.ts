import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardAlert } from "@/features/dashboard/dashboardTypes";
import { dashboardService } from "@/services";
import { toServiceError } from "@/services/mock/mockDelay";
import type { AsyncStatus, ServiceError } from "@/types/api";
import type { EntityId } from "@/types/common";

export interface NotificationsState {
  items: DashboardAlert[];
  status: AsyncStatus;
  error: ServiceError | null;
  /** Read state is kept for the browser session only. */
  readIds: EntityId[];
}

const initialState: NotificationsState = {
  items: [],
  status: "idle",
  error: null,
  readIds: [],
};

export const fetchNotifications = createAsyncThunk<
  DashboardAlert[],
  void,
  { state: { notifications: NotificationsState }; rejectValue: ServiceError }
>(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getAlerts();
    } catch (error) {
      return rejectWithValue(toServiceError(error));
    }
  },
  { condition: (_, { getState }) => getState().notifications.status !== "loading" },
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markNotificationRead(state, action: PayloadAction<EntityId>) {
      if (!state.readIds.includes(action.payload)) state.readIds.push(action.payload);
    },
    markNotificationsRead(state, action: PayloadAction<EntityId[]>) {
      for (const id of action.payload) {
        if (!state.readIds.includes(id)) state.readIds.push(id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? { code: "UNKNOWN", message: "Alerts could not be loaded." };
      });
  },
});

export const { markNotificationRead, markNotificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
