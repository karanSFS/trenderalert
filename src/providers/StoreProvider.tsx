"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { restoreDemoSession } from "@/features/auth/authSlice";
import type { DemoSessionSnapshot } from "@/features/auth/authTypes";
import { setSidebarCollapsed, type LayoutState } from "@/features/settings/layoutSlice";
import { restoreTheme } from "@/features/settings/themeSlice";
import { STORAGE_KEYS } from "@/lib/constants/app";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/styles/themes";
import { makeStore, type AppStore } from "@/store";
import { readJson } from "@/store/persistence";

/**
 * Creates one store per browser session (and per request on the server). Saved preferences are
 * restored after mount so the server and first client render always match.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(restoreTheme(readJson<Partial<ThemePreference>>(THEME_STORAGE_KEY)));
    const layout = readJson<Partial<LayoutState>>(STORAGE_KEYS.layout);
    if (typeof layout?.sidebarCollapsed === "boolean") {
      store.dispatch(setSidebarCollapsed(layout.sidebarCollapsed));
    }
    const session = readJson<DemoSessionSnapshot>(STORAGE_KEYS.demoSession);
    store.dispatch(restoreDemoSession(session?.accountId ?? null));
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
