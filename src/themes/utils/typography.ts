import type { Palette, TypographyVariantsOptions } from "@mui/material/styles";

// Text colors are read from the active scheme's palette. The light values are
// identical to the previous hardcoded `colors.light.text.*`.
const typography = (palette: Palette): TypographyVariantsOptions => ({
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: "34px",
    lineHeight: "34px",
    letterSpacing: "-0.1px",
    fontWeight: 700,
    color: palette.text.primary,
  },
  h2: {
    fontSize: "24px",
    lineHeight: "34px",
    letterSpacing: "-0.1px",
    fontWeight: 500,
    color: palette.text.primary,
  },
  h3: {
    fontSize: "18px",
    lineHeight: "23px",
    letterSpacing: "-0.1px",
    fontWeight: 400,
    color: palette.text.primary,
  },
  h4: {
    fontSize: "16px",
    lineHeight: "23px",
    letterSpacing: "-0.1px",
    fontWeight: 400,
    color: palette.text.primary,
  },
  h5: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "-0.1px",
    fontWeight: 500,
    color: palette.text.primary,
  },
  subtitle2: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 700,
    color: palette.text.secondary,
  },
  body1: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 300,
    color: palette.text.primary,
  },
  body2: {
    fontSize: "14px",
    lineHeight: "22px",
    letterSpacing: "0.1px",
    fontWeight: 400,
    color: palette.text.primary,
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
});

export default typography;
