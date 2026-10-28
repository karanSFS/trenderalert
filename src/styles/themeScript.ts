import {
  DEFAULT_THEME,
  THEME_PRESETS,
  THEME_STORAGE_KEY,
  cssVariablesToString,
  toCssVariables,
  type ThemeMode,
  type ThemePresetId,
} from "./themes";

type ThemeVarTable = Record<ThemePresetId, Record<ThemeMode, Record<string, string>>>;

function buildVarTable(): ThemeVarTable {
  const table = {} as ThemeVarTable;
  for (const preset of Object.values(THEME_PRESETS)) {
    table[preset.id] = {
      light: toCssVariables(preset.modes.light),
      dark: toCssVariables(preset.modes.dark),
    };
  }
  return table;
}

/** Default `:root` variables rendered on the server so the first paint is styled without JS. */
export function getDefaultThemeCss(): string {
  const vars = toCssVariables(THEME_PRESETS[DEFAULT_THEME.preset].modes[DEFAULT_THEME.mode]);
  return `:root{${cssVariablesToString(vars)}color-scheme:${DEFAULT_THEME.mode};}`;
}

/**
 * Inline script executed before hydration. It applies the saved preset's CSS variables so
 * custom surfaces never flash the default theme. Ant Design tokens follow once Redux rehydrates.
 */
export function getThemeBootstrapScript(): string {
  const table = JSON.stringify(buildVarTable());
  const fallback = JSON.stringify(DEFAULT_THEME);
  return `(function(){try{var t=${table};var d=${fallback};var p=d;var raw=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY,
  )});if(raw){var s=JSON.parse(raw);if(s&&t[s.preset]&&t[s.preset][s.mode]){p=s;}}var v=t[p.preset][p.mode];var r=document.documentElement;for(var k in v){r.style.setProperty(k,v[k]);}r.dataset.theme=p.preset;r.dataset.mode=p.mode;r.style.colorScheme=p.mode;}catch(e){}})();`;
}
