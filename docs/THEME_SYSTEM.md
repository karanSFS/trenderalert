# Theme System

## Overview

One typed source, `src/styles/themes.ts`, defines every theme value. Three styling mechanisms are derived from it and stay in sync:

| Mechanism                         | Source                                               | Used by                                                                        |
| --------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| CSS variables (`--ta-*`)          | `toCssVariables()`                                   | Global CSS, CSS Modules on public pages, styled-components                     |
| Ant Design `ConfigProvider` theme | `buildAntdTheme()` in `src/styles/antdTheme.ts`      | All antd components, including portals (modals, dropdowns, popovers, messages) |
| styled-components theme           | `createStyledTheme()` in `src/styles/styledTheme.ts` | Custom components                                                              |

The styled-components theme contains **CSS variable references** (for example `theme.colors.primary` is `var(--ta-color-primary)`), not raw values. Generated CSS is therefore identical on server and client, and switching themes does not regenerate classes.

## Tokens

`ThemeTokens` contains:

- **colors:** primary, primaryHover, primaryActive, primarySoft, onPrimary, accentText, secondary, background, surface, surfaceElevated, surfaceMuted, sidebarBackground, sidebarText, sidebarTextMuted, sidebarActiveBackground, sidebarActiveText, sidebarBorder, textPrimary, textSecondary, textTertiary, border, borderStrong, success(+Soft), warning(+Soft), error(+Soft), info(+Soft), focusRing.
- **radii:** button (8), card (12), input (8), tag (6).
- **spacing:** base unit (4px). CSS exposes `--ta-space-1` to `--ta-space-16`.
- **typography:** font families, sizes (sm, base, lg, h1-h4), line height, heading weight.
- **shadows:** card, elevated.

Static, theme-independent tokens (sidebar width, header height, z-index, transitions) live in `src/styles/tokens.css`.

## Presets

Every preset uses the brand yellow `#FFD400` (owner-selected value from the specification) and ships a light and a dark mode.

| Preset                       | Light mode                                              | Dark mode                                                                                 |
| ---------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `trenderalert` (default)     | `#F7F7F5` background, white surfaces, `#111111` sidebar | Neutral black `#0E0E0E` / `#1A1A1A`                                                       |
| `midnight` (Midnight Signal) | Cool gray `#F3F5F8`, `#161A20` sidebar                  | Specification review tokens `#080A0D` / `#161A20` / `#20252D`, text `#F6F6F2` / `#A5ADB7` |
| `graphite` (Graphite Amber)  | Warm ivory `#FAF8F2`, `#2B2620` sidebar                 | Warm graphite `#14120F` / `#1E1B17`                                                       |

Status colors follow the prompt defaults in light mode (success `#16803D`, warning `#B7791F`, error `#C62828`, info `#2563EB`) with lighter equivalents in dark mode.

## Contrast rules

- Yellow is an accent. Text on yellow always uses `onPrimary` (`#111111`).
- Yellow text on light surfaces fails contrast. In light mode, links use `accentText` (dark gold `#7A5E00`), and selected tabs, pagination and focused inputs use ink. In dark mode those use yellow.
- Antd components that would place white on yellow (checkbox, radio, date cells, steps) are overridden to use `onPrimary`.
- Focus outlines use `focusRing` (ink in light mode, yellow in dark mode).

## Persistence and hydration

1. The server renders `:root` variables for the default theme (`<style id="ta-theme-defaults">`).
2. An inline script in `<head>` (`getThemeBootstrapScript()`) reads `localStorage["ta.theme"]` before hydration and applies the saved preset's CSS variables and `data-theme` / `data-mode` on `<html>`. Custom surfaces therefore never flash the default theme.
3. Redux starts with the default theme on both server and client, so markup matches during hydration.
4. After mount, `StoreProvider` dispatches `restoreTheme(saved)`. Ant Design tokens update to the saved theme at this point.
5. Every change is written back to `localStorage` by the persistence listener.

Known trade-off: on a hard refresh with a non-default theme, Ant Design components can render with default tokens for a single frame before the saved tokens apply. Custom surfaces are unaffected because they use CSS variables.

## Using the theme

- styled-components: `color: ${({ theme }) => theme.colors.textPrimary};`, `padding: ${({ theme }) => theme.space(4)};`, `@media ${({ theme }) => theme.breakpoints.lg} { ... }`.
- CSS Modules: `color: var(--ta-color-text-primary);`.
- Never hardcode colors in components. Use a token, or add one.

## Adding a theme

1. Add an id to `THEME_PRESET_IDS` in `src/styles/themes.ts`.
2. Add a `ThemePreset` entry with `light` and `dark` color sets (reuse `brandPrimary`, the shared status sets and `tokens()`).
3. Check contrast for text, links and status colors on its surfaces.
4. Nothing else is required: the switcher, bootstrap script and CSS variables pick it up automatically.

## Adding a token

1. Add it to the relevant interface and every preset in `themes.ts`.
2. For colors, add the key to `colorKeys` in `styledTheme.ts`.
3. Map it in `buildAntdTheme()` if an antd token should follow it.
