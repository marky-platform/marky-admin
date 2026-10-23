import { createTheme } from "@mui/material/styles";
import colors, { fixedColors } from "./utils/colors";
import type { SchemeColors } from "./utils/colors";
import typography from "./utils/typography";
import components from "./utils/components";

/** Names of the registered color schemes. Add new palette themes here. */
export const COLOR_SCHEMES = ["light", "dark"] as const;
export type ColorSchemeName = (typeof COLOR_SCHEMES)[number];

/**
 * Mode used when nothing is stored: first-time visitors follow the OS
 * (prefers-color-scheme). Once the user toggles, their choice is persisted.
 */
export const DEFAULT_COLOR_MODE: "light" | "dark" | "system" = "system";

/** localStorage key shared by admin and public pages (one preference). */
export const COLOR_MODE_STORAGE_KEY = "marky-color-mode";

const toPalette = (scheme: SchemeColors) => ({
  primary: scheme.primary,
  secondary: scheme.secondary,
  error: scheme.error,
  success: scheme.success,
  text: scheme.text,
  grey: scheme.grey,
  background: scheme.background,
  surface: scheme.surface,
  border: scheme.border,
  accent: scheme.accent,
  scrollbar: scheme.scrollbar,
  pulse: scheme.pulse,
  shadow: scheme.shadow,
  fixed: fixedColors,
});

const schemes: Record<ColorSchemeName, SchemeColors> = {
  light: colors.light,
  dark: colors.dark,
};

// `colorSchemes` without `cssVariables` on purpose: `theme.palette` then
// follows the active scheme (existing `theme.palette.*` reads keep working)
// and the emitted light CSS stays byte-identical (e.g. spacing in px).
//
// A factory (not `createTheme(theme, …)`): MUI rebuilds `colorSchemes` from
// the options it is given, so scheme overrides must be passed in at creation.
export const createAppTheme = (
  darkOverrides: Partial<ReturnType<typeof toPalette>> = {}
) =>
  createTheme({
    colorSchemes: {
      light: { palette: toPalette(schemes.light) },
      dark: { palette: { ...toPalette(schemes.dark), ...darkOverrides } },
    },
    spacing: 4,
    typography,
    components,
  });

const theme = createAppTheme();

export default theme;
