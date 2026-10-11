import logoLight from "../assets/images/marky-logo.svg";
import logoDark from "../assets/images/marky-logo-dark.svg";
import type { ColorSchemeName } from "./theme";

// Everything that varies per color scheme and can't be expressed as a palette
// token lives here, keyed by scheme name (Record => a new scheme that forgets
// an entry is a TypeScript error). Components read it through
// `useThemeAssets()` and never branch on the mode name.
//
// Open (Phase 2, assets subagent): dark variants of marky-logo.png and
// marky-m-gray-logo.png, per-scheme icon SVGs, phone-input CSS, toast theme.
export interface ThemeAssets {
  /** Marky wordmark (SVG, 110x22). */
  logo: string;
  /** react-toastify `theme` option. */
  toastTheme: "light" | "dark" | "colored";
}

export const themeAssets: Record<ColorSchemeName, ThemeAssets> = {
  light: { logo: logoLight, toastTheme: "dark" },
  dark: { logo: logoDark, toastTheme: "dark" },
};
