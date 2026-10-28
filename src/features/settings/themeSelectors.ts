import type { RootState } from "@/store";

export const selectThemePreference = (state: RootState) => state.theme;
export const selectThemePreset = (state: RootState) => state.theme.preset;
export const selectThemeMode = (state: RootState) => state.theme.mode;
