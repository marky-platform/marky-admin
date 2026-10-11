import { themeAssets } from "./assets";
import type { ThemeAssets } from "./assets";
import { useTheme } from "./ThemeContext";

export const useThemeAssets = (): ThemeAssets => {
  const { resolvedMode } = useTheme();
  return themeAssets[resolvedMode];
};
