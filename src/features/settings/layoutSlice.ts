import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export interface LayoutState {
  sidebarCollapsed: boolean;
}

const initialState: LayoutState = { sidebarCollapsed: false };

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { setSidebarCollapsed, toggleSidebar } = layoutSlice.actions;
export const selectSidebarCollapsed = (state: RootState) => state.layout.sidebarCollapsed;
export default layoutSlice.reducer;
