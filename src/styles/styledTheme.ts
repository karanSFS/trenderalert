import type { SPACE_STEPS, ThemeColors, ThemeMode, ThemePresetId, ThemeRadii } from "./themes";

type VarMap<T> = { [K in keyof T]: string };

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function varRefs<T extends object>(prefix: string, keys: (keyof T & string)[]): VarMap<T> {
  return Object.fromEntries(
    keys.map((key) => [key, `var(--ta-${prefix}-${kebab(key)})`]),
  ) as VarMap<T>;
}

const colorKeys: (keyof ThemeColors)[] = [
  "primary",
  "primaryHover",
  "primaryActive",
  "primarySoft",
  "onPrimary",
  "accentText",
  "secondary",
  "background",
  "surface",
  "surfaceElevated",
  "surfaceMuted",
  "sidebarBackground",
  "sidebarText",
  "sidebarTextMuted",
  "sidebarActiveBackground",
  "sidebarActiveText",
  "sidebarBorder",
  "textPrimary",
  "textSecondary",
  "textTertiary",
  "border",
  "borderStrong",
  "success",
  "successSoft",
  "warning",
  "warningSoft",
  "error",
  "errorSoft",
  "info",
  "infoSoft",
  "focusRing",
];

const radiusKeys: (keyof ThemeRadii)[] = ["button", "card", "input", "tag"];

export type SpaceStep = (typeof SPACE_STEPS)[number];

/**
 * styled-components theme. Values are CSS variable references, so generated CSS is identical
 * on the server and client and switching themes never re-generates class names.
 */
export interface StyledTheme {
  preset: ThemePresetId;
  mode: ThemeMode;
  colors: VarMap<ThemeColors>;
  radii: VarMap<ThemeRadii>;
  space: (step: SpaceStep) => string;
  font: {
    family: string;
    mono: string;
    sizeSm: string;
    sizeBase: string;
    sizeLg: string;
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    headingWeight: string;
    lineHeight: string;
  };
  shadows: { card: string; elevated: string };
  breakpoints: { sm: string; md: string; lg: string; xl: string };
}

export function createStyledTheme(preset: ThemePresetId, mode: ThemeMode): StyledTheme {
  return {
    preset,
    mode,
    colors: varRefs<ThemeColors>("color", colorKeys),
    radii: varRefs<ThemeRadii>("radius", radiusKeys),
    space: (step) => `var(--ta-space-${step})`,
    font: {
      family: "var(--ta-font-family)",
      mono: "var(--ta-font-family-mono)",
      sizeSm: "var(--ta-font-size-sm)",
      sizeBase: "var(--ta-font-size-base)",
      sizeLg: "var(--ta-font-size-lg)",
      h1: "var(--ta-font-size-h1)",
      h2: "var(--ta-font-size-h2)",
      h3: "var(--ta-font-size-h3)",
      h4: "var(--ta-font-size-h4)",
      headingWeight: "var(--ta-heading-weight)",
      lineHeight: "var(--ta-line-height)",
    },
    shadows: { card: "var(--ta-shadow-card)", elevated: "var(--ta-shadow-elevated)" },
    breakpoints: {
      sm: "(min-width: 576px)",
      md: "(min-width: 768px)",
      lg: "(min-width: 992px)",
      xl: "(min-width: 1200px)",
    },
  };
}
