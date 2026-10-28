import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_THEME,
  isThemeMode,
  isThemePresetId,
  type ThemeMode,
  type ThemePreference,
  type ThemePresetId,
} from "@/styles/themes";

export interface ThemeState extends ThemePreference {
  /** True once the saved preference has been read on the client. */
  restored: boolean;
}

const initialState: ThemeState = { ...DEFAULT_THEME, restored: false };

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemePreset(state, action: PayloadAction<ThemePresetId>) {
      state.preset = action.payload;
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleThemeMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    resetTheme(state) {
      state.preset = DEFAULT_THEME.preset;
      state.mode = DEFAULT_THEME.mode;
    },
    restoreTheme(state, action: PayloadAction<Partial<ThemePreference> | null>) {
      const saved = action.payload;
      if (saved && isThemePresetId(saved.preset)) state.preset = saved.preset;
      if (saved && isThemeMode(saved.mode)) state.mode = saved.mode;
      state.restored = true;
    },
  },
});

export const { setThemePreset, setThemeMode, toggleThemeMode, resetTheme, restoreTheme } =
  themeSlice.actions;
export default themeSlice.reducer;
