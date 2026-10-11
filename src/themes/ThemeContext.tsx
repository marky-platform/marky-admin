// ThemeContext.tsx
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import theme, { COLOR_MODE_STORAGE_KEY, DEFAULT_COLOR_MODE } from "./theme";
import type { ColorSchemeName } from "./theme";

export type ColorMode = "light" | "dark" | "system";

interface ColorModeContextValue {
  /** Stored preference (`system` follows prefers-color-scheme). */
  mode: ColorMode;
  /** Scheme actually applied right now. */
  resolvedMode: ColorSchemeName;
  setMode: (mode: ColorMode) => void;
  /** Switches between light and dark (leaves `system`). */
  toggleMode: () => void;
  /** @deprecated use `toggleMode`. */
  toggleTheme: () => void;
}

const noop = () => {};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  resolvedMode: "light",
  setMode: noop,
  toggleMode: noop,
  toggleTheme: noop,
});

// Custom hook to use the color mode controller
export const useTheme = () => useContext(ColorModeContext);

const ColorModeBridge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode, systemMode, setMode } = useColorScheme();

  const currentMode: ColorMode = mode ?? "system";
  const resolvedMode: ColorSchemeName =
    (currentMode === "system" ? systemMode : currentMode) === "dark"
      ? "dark"
      : "light";

  const toggleMode = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode: currentMode,
      resolvedMode,
      setMode,
      toggleMode,
      toggleTheme: toggleMode,
    }),
    [currentMode, resolvedMode, setMode, toggleMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      {children}
    </ColorModeContext.Provider>
  );
};

// ThemeProvider component: one theme, many color schemes. The preference is
// persisted and shared by admin and public pages.
export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ThemeProvider
    theme={theme}
    defaultMode={DEFAULT_COLOR_MODE}
    modeStorageKey={COLOR_MODE_STORAGE_KEY}
  >
    <ColorModeBridge>{children}</ColorModeBridge>
  </ThemeProvider>
);
