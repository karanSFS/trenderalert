/**
 * Single source of truth for every theme value in the application.
 * CSS variables, the Ant Design theme and the styled-components theme are all derived from here.
 */

export type ThemeMode = "light" | "dark";

export const THEME_PRESET_IDS = ["trenderalert", "midnight", "graphite"] as const;
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySoft: string;
  /** Text and icons placed on top of the primary color. */
  onPrimary: string;
  /** Accent used for links and highlighted text; must stay readable on `surface`. */
  accentText: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  sidebarBackground: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActiveBackground: string;
  sidebarActiveText: string;
  sidebarBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  focusRing: string;
}

export interface ThemeRadii {
  button: number;
  card: number;
  input: number;
  tag: number;
}

export interface ThemeSpacing {
  /** Base unit in px. All spacing is a multiple of this value. */
  base: number;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeSm: number;
  fontSizeBase: number;
  fontSizeLg: number;
  lineHeight: number;
  headingWeight: number;
  h1: number;
  h2: number;
  h3: number;
  h4: number;
}

export interface ThemeShadows {
  card: string;
  elevated: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
}

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description: string;
  modes: Record<ThemeMode, ThemeTokens>;
}

export interface ThemePreference {
  preset: ThemePresetId;
  mode: ThemeMode;
}

export const DEFAULT_THEME: ThemePreference = { preset: "trenderalert", mode: "light" };

const BRAND_YELLOW = "#FFD400";
const BRAND_INK = "#111111";

const brandPrimary = {
  primary: BRAND_YELLOW,
  primaryHover: "#FFDD33",
  primaryActive: "#E6BF00",
  onPrimary: BRAND_INK,
};

const lightStatus = {
  success: "#16803D",
  successSoft: "#E8F5EC",
  warning: "#B7791F",
  warningSoft: "#FBF1E1",
  error: "#C62828",
  errorSoft: "#FBE9E9",
  info: "#2563EB",
  infoSoft: "#E8EFFD",
};

const darkStatus = {
  success: "#4ADE80",
  successSoft: "rgba(74, 222, 128, 0.12)",
  warning: "#F0B44C",
  warningSoft: "rgba(240, 180, 76, 0.12)",
  error: "#F87171",
  errorSoft: "rgba(248, 113, 113, 0.12)",
  info: "#7AA7FF",
  infoSoft: "rgba(122, 167, 255, 0.12)",
};

const sharedRadii: ThemeRadii = { button: 8, card: 12, input: 8, tag: 6 };
const sharedSpacing: ThemeSpacing = { base: 4 };
const sharedTypography: ThemeTypography = {
  fontFamily:
    'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMono:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  fontSizeSm: 12,
  fontSizeBase: 14,
  fontSizeLg: 16,
  lineHeight: 1.5715,
  headingWeight: 650,
  h1: 30,
  h2: 24,
  h3: 19,
  h4: 16,
};

const lightShadows: ThemeShadows = {
  card: "0 1px 2px rgba(17, 17, 17, 0.04), 0 1px 3px rgba(17, 17, 17, 0.06)",
  elevated: "0 8px 24px rgba(17, 17, 17, 0.10), 0 2px 6px rgba(17, 17, 17, 0.06)",
};

const darkShadows: ThemeShadows = {
  card: "0 1px 2px rgba(0, 0, 0, 0.4)",
  elevated: "0 12px 32px rgba(0, 0, 0, 0.55), 0 2px 8px rgba(0, 0, 0, 0.35)",
};

function tokens(colors: ThemeColors, mode: ThemeMode): ThemeTokens {
  return {
    colors,
    radii: sharedRadii,
    spacing: sharedSpacing,
    typography: sharedTypography,
    shadows: mode === "dark" ? darkShadows : lightShadows,
  };
}

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  trenderalert: {
    id: "trenderalert",
    name: "TrenderAlert",
    description: "Default brand theme: yellow accents with a black navigation rail.",
    modes: {
      light: tokens(
        {
          ...brandPrimary,
          ...lightStatus,
          primarySoft: "#FFF7CC",
          accentText: "#7A5E00",
          secondary: "#1C1C1C",
          background: "#F7F7F5",
          surface: "#FFFFFF",
          surfaceElevated: "#FFFFFF",
          surfaceMuted: "#F1F1EE",
          sidebarBackground: BRAND_INK,
          sidebarText: "#D6D6D1",
          sidebarTextMuted: "#8C8C86",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.14)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#262626",
          textPrimary: "#171717",
          textSecondary: "#666661",
          textTertiary: "#8A8A84",
          border: "#E7E7E7",
          borderStrong: "#D2D2CE",
          focusRing: BRAND_INK,
        },
        "light",
      ),
      dark: tokens(
        {
          ...brandPrimary,
          ...darkStatus,
          primarySoft: "rgba(255, 212, 0, 0.14)",
          accentText: BRAND_YELLOW,
          secondary: "#E6E6E1",
          background: "#0E0E0E",
          surface: "#1A1A1A",
          surfaceElevated: "#242424",
          surfaceMuted: "#141414",
          sidebarBackground: "#080808",
          sidebarText: "#D6D6D1",
          sidebarTextMuted: "#8C8C86",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.14)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#1F1F1F",
          textPrimary: "#F5F5F0",
          textSecondary: "#A8A8A2",
          textTertiary: "#7E7E78",
          border: "#2E2E2E",
          borderStrong: "#3D3D3D",
          focusRing: BRAND_YELLOW,
        },
        "dark",
      ),
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight Signal",
    description: "Cool blue-black surfaces based on the specification's suggested app tokens.",
    modes: {
      light: tokens(
        {
          ...brandPrimary,
          ...lightStatus,
          primarySoft: "#FFF7CC",
          accentText: "#7A5E00",
          secondary: "#161A20",
          background: "#F3F5F8",
          surface: "#FFFFFF",
          surfaceElevated: "#FFFFFF",
          surfaceMuted: "#ECEFF3",
          sidebarBackground: "#161A20",
          sidebarText: "#D3D8DF",
          sidebarTextMuted: "#8B939E",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.14)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#242A33",
          textPrimary: "#14181E",
          textSecondary: "#5E6672",
          textTertiary: "#858D98",
          border: "#E1E5EA",
          borderStrong: "#CDD3DA",
          focusRing: "#161A20",
        },
        "light",
      ),
      dark: tokens(
        {
          ...brandPrimary,
          ...darkStatus,
          primarySoft: "rgba(255, 212, 0, 0.14)",
          accentText: BRAND_YELLOW,
          secondary: "#F6F6F2",
          background: "#080A0D",
          surface: "#161A20",
          surfaceElevated: "#20252D",
          surfaceMuted: "#101318",
          sidebarBackground: "#05070A",
          sidebarText: "#D3D8DF",
          sidebarTextMuted: "#8B939E",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.14)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#161A20",
          textPrimary: "#F6F6F2",
          textSecondary: "#A5ADB7",
          textTertiary: "#7D8590",
          border: "#262C35",
          borderStrong: "#343B46",
          focusRing: BRAND_YELLOW,
        },
        "dark",
      ),
    },
  },
  graphite: {
    id: "graphite",
    name: "Graphite Amber",
    description: "Warm ivory and graphite surfaces with the same brand yellow.",
    modes: {
      light: tokens(
        {
          ...brandPrimary,
          ...lightStatus,
          primarySoft: "#FFF5C2",
          accentText: "#765A00",
          secondary: "#2B2620",
          background: "#FAF8F2",
          surface: "#FFFFFF",
          surfaceElevated: "#FFFFFF",
          surfaceMuted: "#F3EFE5",
          sidebarBackground: "#2B2620",
          sidebarText: "#E2DCCF",
          sidebarTextMuted: "#A0988A",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.16)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#3A342C",
          textPrimary: "#1F1B16",
          textSecondary: "#6A6358",
          textTertiary: "#8F887C",
          border: "#E9E4D8",
          borderStrong: "#D8D1C2",
          focusRing: "#2B2620",
        },
        "light",
      ),
      dark: tokens(
        {
          ...brandPrimary,
          ...darkStatus,
          primarySoft: "rgba(255, 212, 0, 0.14)",
          accentText: BRAND_YELLOW,
          secondary: "#EFE9DC",
          background: "#14120F",
          surface: "#1E1B17",
          surfaceElevated: "#282420",
          surfaceMuted: "#191612",
          sidebarBackground: "#0F0D0B",
          sidebarText: "#E2DCCF",
          sidebarTextMuted: "#A0988A",
          sidebarActiveBackground: "rgba(255, 212, 0, 0.14)",
          sidebarActiveText: BRAND_YELLOW,
          sidebarBorder: "#221E19",
          textPrimary: "#F4EFE4",
          textSecondary: "#B0A797",
          textTertiary: "#857D70",
          border: "#36312A",
          borderStrong: "#463F36",
          focusRing: BRAND_YELLOW,
        },
        "dark",
      ),
    },
  },
};

export function isThemePresetId(value: unknown): value is ThemePresetId {
  return typeof value === "string" && (THEME_PRESET_IDS as readonly string[]).includes(value);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

export function getThemeTokens({ preset, mode }: ThemePreference): ThemeTokens {
  return THEME_PRESETS[preset].modes[mode];
}

function toKebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

export const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16] as const;

/** Flattens tokens into `--ta-*` CSS custom properties. */
export function toCssVariables(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--ta-color-${toKebab(key)}`] = value;
  }
  for (const [key, value] of Object.entries(theme.radii)) {
    vars[`--ta-radius-${toKebab(key)}`] = `${value}px`;
  }
  vars["--ta-space-unit"] = `${theme.spacing.base}px`;
  for (const step of SPACE_STEPS) {
    vars[`--ta-space-${step}`] = `${theme.spacing.base * step}px`;
  }
  const t = theme.typography;
  vars["--ta-font-family"] = t.fontFamily;
  vars["--ta-font-family-mono"] = t.fontFamilyMono;
  vars["--ta-font-size-sm"] = `${t.fontSizeSm}px`;
  vars["--ta-font-size-base"] = `${t.fontSizeBase}px`;
  vars["--ta-font-size-lg"] = `${t.fontSizeLg}px`;
  vars["--ta-line-height"] = `${t.lineHeight}`;
  vars["--ta-heading-weight"] = `${t.headingWeight}`;
  vars["--ta-font-size-h1"] = `${t.h1}px`;
  vars["--ta-font-size-h2"] = `${t.h2}px`;
  vars["--ta-font-size-h3"] = `${t.h3}px`;
  vars["--ta-font-size-h4"] = `${t.h4}px`;
  vars["--ta-shadow-card"] = theme.shadows.card;
  vars["--ta-shadow-elevated"] = theme.shadows.elevated;
  return vars;
}

export function cssVariablesToString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
}

export const THEME_STORAGE_KEY = "ta.theme";
