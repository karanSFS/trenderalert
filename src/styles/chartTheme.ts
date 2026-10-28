"use client";

import { useMemo } from "react";
import { selectThemePreference } from "@/features/settings/themeSelectors";
import { useAppSelector } from "@/store/hooks";
import { getThemeTokens, type ThemeMode } from "./themes";

export interface ChartAxisStyle {
  labelFill: string;
  titleFill: string;
  gridStroke: string;
  lineStroke: string;
  tickStroke: string;
}

export interface ChartTheme {
  mode: ThemeMode;
  /** Categorical series colors, brand yellow first. */
  palette: string[];
  colors: {
    primary: string;
    text: string;
    textSecondary: string;
    grid: string;
    surface: string;
  };
  /** Pass as `theme` in an @ant-design/charts config. */
  g2Theme: {
    type: "classic" | "classicDark";
    category10: string[];
    category20: string[];
    view: { viewFill: string };
  };
  /** Spread into `axis.x` / `axis.y` of a chart config. */
  axis: ChartAxisStyle;
}

/**
 * Chart colors derived from the active theme tokens, so charts follow every preset and mode.
 * Charts must render client-side (for example through `next/dynamic` with `ssr: false`).
 */
export function useChartTheme(): ChartTheme {
  const preference = useAppSelector(selectThemePreference);

  return useMemo(() => {
    const { colors } = getThemeTokens(preference);
    const palette = [
      colors.primary,
      colors.secondary,
      colors.info,
      colors.success,
      colors.warning,
      colors.error,
      colors.textTertiary,
    ];
    return {
      mode: preference.mode,
      palette,
      colors: {
        primary: colors.primary,
        text: colors.textPrimary,
        textSecondary: colors.textSecondary,
        grid: colors.border,
        surface: colors.surface,
      },
      g2Theme: {
        type: preference.mode === "dark" ? "classicDark" : "classic",
        category10: palette,
        category20: [...palette, ...palette],
        view: { viewFill: "transparent" },
      },
      axis: {
        labelFill: colors.textSecondary,
        titleFill: colors.textSecondary,
        gridStroke: colors.border,
        lineStroke: colors.borderStrong,
        tickStroke: colors.borderStrong,
      },
    };
  }, [preference]);
}
