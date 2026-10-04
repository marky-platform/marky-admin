import colors from "./colors";

const components = {
  MuiButton: {
    variants: [
      {
        props: { variant: "grey1" },
        style: {
          backgroundColor: "#EDEDED",
          color: "#4B4B4B",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#dcdcdc",
          },
        },
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
    },
  },
  MuiFormLabel: {
    styleOverrides: {
      root: {
        color: colors.light.text.primary,
        "&.MuiFormLabel-root": {
          color: colors.light.text.primary,
        },
        fontSize: "14px",
        lineHeight: "22px",
        letterSpacing: "-0.1px",
        fontWeight: 500,
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        color: colors.light.grey[800],
        "&.Mui-checked": {
          color: colors.light.primary,
        },
      },
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
    styleOverrides: {
      // For Chrome, Safari, Edge, Opera
      "*::-webkit-scrollbar": {
        width: "6px",
      },
      "*::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius: "4px",
      },
      "*::-webkit-scrollbar-thumb": {
        backgroundColor: "#c1c1c1",
        borderRadius: "4px",
      },
    },
  },
};

export default components;
