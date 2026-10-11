import type { TypographyVariantsOptions } from "@mui/material/styles";

// Variant colors are NOT set here: `theme.typography` is built once and would
// freeze the light palette. They live in `MuiTypography.styleOverrides`
// (components.ts), which reads the active scheme's palette.
const typography: TypographyVariantsOptions = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: "34px",
    lineHeight: "34px",
    letterSpacing: "-0.1px",
    fontWeight: 700,
  },
  h2: {
    fontSize: "24px",
    lineHeight: "34px",
    letterSpacing: "-0.1px",
    fontWeight: 500,
  },
  h3: {
    fontSize: "18px",
    lineHeight: "23px",
    letterSpacing: "-0.1px",
    fontWeight: 400,
  },
  h4: {
    fontSize: "16px",
    lineHeight: "23px",
    letterSpacing: "-0.1px",
    fontWeight: 400,
  },
  h5: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "-0.1px",
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 700,
  },
  body1: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 300,
  },
  body2: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 400,
  },
  link: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "22px",
    letterSpacing: "-0.1px",
    textAlign: "left",
  },
  caption: {
    fontSize: "12px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 400,
  },
  button: {
    fontSize: "15px",
  },
};

export default typography;
