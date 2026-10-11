import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme } from "./theme";
import colors from "./utils/colors";

// "Layer rule": fields and cards that sit inside a modal read as inset, so in
// dark mode they must not use the same surface as the modal itself. Only the
// dark scheme changes (light `surface.inset` equals today's white `grey.100`).
const insetTheme = createAppTheme({
  grey: { ...colors.dark.grey, 100: colors.dark.surface.inset },
});

const InsetSurface: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ThemeProvider theme={insetTheme}>{children}</ThemeProvider>;

export default InsetSurface;
