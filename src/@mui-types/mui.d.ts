// src/@mui-types/mui.d.ts
import "@mui/material/Typography";
import type { CSSProperties } from "react";
import type { FixedColors, SchemeColors } from "../themes/utils/colors";

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    link: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    grey1: true;
  }
}

// Semantic tokens (see themes/utils/colors.ts). Every scheme must define all
// of them: `SchemeColors` is the single contract.
declare module "@mui/material/styles" {
  interface TypographyVariants {
    link: CSSProperties;
  }
  interface TypographyVariantsOptions {
    link?: CSSProperties;
  }
  interface Palette {
    surface: SchemeColors["surface"];
    border: SchemeColors["border"];
    accent: SchemeColors["accent"];
    scrollbar: SchemeColors["scrollbar"];
    shadow: SchemeColors["shadow"];
    fixed: FixedColors;
  }
  interface PaletteOptions {
    surface?: SchemeColors["surface"];
    border?: SchemeColors["border"];
    accent?: SchemeColors["accent"];
    scrollbar?: SchemeColors["scrollbar"];
    shadow?: SchemeColors["shadow"];
    fixed?: FixedColors;
  }
  interface TypeText {
    strong: string;
    heading: string;
    title: string;
    body: string;
    muted: string;
    faint: string;
    soft: string;
    placeholder: string;
  }
}
