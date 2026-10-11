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
  MuiPaper: {
    styleOverrides: {
      // MUI paints a translucent white elevation overlay on Paper in dark
      // mode, which tints surfaces away from the palette token. No effect in
      // light mode (no overlay exists there).
      root: { backgroundImage: "none" },
    },
  },
  MuiTypography: {
    styleOverrides: {
      // Same colors the typography variants used to carry (light values are
      // unchanged), but read from the active scheme.
      root: ({ theme, ownerState }) => {
        // An explicit `color` prop wins, exactly as it did over the variant.
        if (ownerState.color) return {};
        switch (ownerState.variant) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "body1":
          case "body2":
            return { color: theme.palette.text.primary };
          case "subtitle2":
            return { color: theme.palette.text.secondary };
          default:
            return {};
        }
      },
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
      // Category icons are inline SVGs with a fixed #4B4B4B fill. Light value
      // of text.title is the same #4B4B4B, so light is unchanged; in dark the
      // icons follow the heading color. Scoped by class so other icons that
      // share the fill (flags, brand art) are left alone.
      '.category-icon [fill="#4B4B4B"]': {
        fill: theme.palette.text.title,
      },
    }),
  },
};

export default components;
