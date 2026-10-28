"use client";

import { App as AntdApp, ConfigProvider } from "antd";
import { useEffect, useMemo, type ReactNode } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { useAppSelector } from "@/store/hooks";
import { selectThemePreference } from "@/features/settings/themeSelectors";
import { buildAntdTheme } from "@/styles/antdTheme";
import { createStyledTheme } from "@/styles/styledTheme";
import { getThemeTokens, toCssVariables } from "@/styles/themes";

/**
 * Keeps CSS variables, Ant Design tokens and the styled-components theme in sync with the
 * Redux theme preference.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { preset, mode } = useAppSelector(selectThemePreference);
  const tokens = useMemo(() => getThemeTokens({ preset, mode }), [preset, mode]);
  const antdTheme = useMemo(() => buildAntdTheme(tokens, mode), [tokens, mode]);
  const styledTheme = useMemo(() => createStyledTheme(preset, mode), [preset, mode]);

  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(toCssVariables(tokens))) {
      root.style.setProperty(name, value);
    }
    root.dataset.theme = preset;
    root.dataset.mode = mode;
    root.style.colorScheme = mode;
  }, [tokens, preset, mode]);

  return (
    <ConfigProvider theme={antdTheme} wave={{ disabled: true }}>
      <StyledThemeProvider theme={styledTheme}>
        <AntdApp component={false}>{children}</AntdApp>
      </StyledThemeProvider>
    </ConfigProvider>
  );
}
