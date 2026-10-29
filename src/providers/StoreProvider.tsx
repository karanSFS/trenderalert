"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { restoreSession } from "@/features/auth/authSlice";
import { setSidebarCollapsed, type LayoutState } from "@/features/settings/layoutSlice";
import { restoreTheme } from "@/features/settings/themeSlice";
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/constants/app";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/styles/themes";
import { makeStore, type AppStore } from "@/store";
import { readJson, removeLegacyKeys } from "@/store/persistence";

/**
 * Creates one store per browser session (and per request on the server). Saved preferences and
 * the server session are restored after mount so the server and first client render match.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(restoreTheme(readJson<Partial<ThemePreference>>(THEME_STORAGE_KEY)));
    const layout = readJson<Partial<LayoutState>>(STORAGE_KEYS.layout);
    if (typeof layout?.sidebarCollapsed === "boolean") {
      store.dispatch(setSidebarCollapsed(layout.sidebarCollapsed));
    }
    removeLegacyKeys(LEGACY_STORAGE_KEYS);
    store.dispatch(restoreSession());
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
