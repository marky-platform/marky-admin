import type { Components, Theme } from "@mui/material/styles";

// Overrides read colors from the active scheme's palette (`theme.palette`),
// so the same definitions serve every color scheme.
const components: Components<Theme> = {
  MuiButton: {
    variants: [
      {
        props: { variant: "grey1" },
        style: ({ theme }) => ({
          backgroundColor: theme.palette.grey[400],
          color: theme.palette.text.title,
          boxShadow: "none",
          "&:hover": {
            backgroundColor: theme.palette.surface.pressed,
          },
        }),
      },
    ],
    styleOverrides: {
      root: {
        textTransform: "none",
        padding: "11px 0 11px 0",
        gap: "8px",
        borderRadius: "6px",
        opacity: 1,
      },
      containedPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.accent.button,
        color: theme.palette.accent.onButton,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      }),
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.primary,
        "&.MuiFormLabel-root": {
          color: theme.palette.text.primary,
        },
        fontSize: "14px",
        lineHeight: "22px",
        letterSpacing: "-0.1px",
        fontWeight: 500,
      }),
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.grey[800],
        "&.Mui-checked": {
          color: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: {
        "@media (max-width: 899.95px)": {
          fontSize: "16px",
        },
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      // For Chrome, Safari, Edge, Opera
      "*::-webkit-scrollbar": {
        width: "6px",
      },
      "*::-webkit-scrollbar-track": {
        background: theme.palette.scrollbar.track,
        borderRadius: "4px",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.scrollbar.thumb,
        borderRadius: "4px",
      },
    }),
  },
};

export default components;
