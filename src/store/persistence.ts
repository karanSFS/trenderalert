import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { setSidebarCollapsed, toggleSidebar } from "@/features/settings/layoutSlice";
import {
  resetTheme,
  setThemeMode,
  setThemePreset,
  toggleThemeMode,
} from "@/features/settings/themeSlice";
import { STORAGE_KEYS } from "@/lib/constants/app";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/styles/themes";
import type { rootReducer } from "./rootReducer";

type PersistedRootState = ReturnType<typeof rootReducer>;

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota); preferences then last for the session only.
  }
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Removes keys written by earlier versions, such as the old demo session id. */
export function removeLegacyKeys(keys: readonly string[]) {
  for (const key of keys) writeJson(key, null);
}

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(setThemePreset, setThemeMode, toggleThemeMode, resetTheme),
  effect: (_, api) => {
    const { preset, mode } = (api.getState() as PersistedRootState).theme;
    writeJson(THEME_STORAGE_KEY, { preset, mode } satisfies ThemePreference);
  },
});

persistenceMiddleware.startListening({
  matcher: isAnyOf(setSidebarCollapsed, toggleSidebar),
  effect: (_, api) => {
    writeJson(STORAGE_KEYS.layout, (api.getState() as PersistedRootState).layout);
  },
});
