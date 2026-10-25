// src/themes/utils/colors.ts
//
// Single source of truth for every color scheme. `light` values are exactly
// the literals the app used before dark mode existed (1:1, no merging of
// near-identical greys). `dark` values come from the Figma "Crear modo oscuro"
// navy palette; values marked (proposal) are not covered by the design and
// need approval. See DARK-MODE-REFRESH-PLAN-2026-10-17.md.
//
// Both schemes are typed as `SchemeColors`, so a token missing in any scheme
// is a TypeScript error. To add a palette theme, add another `SchemeColors`
// object and register it in `themes/theme.ts`.

export interface SchemeColors {
  primary: { main: string; dark: string; contrastText: string };
  secondary: { main: string };
  error: { main: string; light: string };
  success: { main: string; light: string };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    /** Headings / strong text (#333 today). */
    strong: string;
    /** #292929 */
    heading: string;
    /** #4B4B4B */
    title: string;
    /** #4F4F4F */
    body: string;
    /** #828282 */
    muted: string;
    /** #757575 */
    faint: string;
    /** #4A4A4A */
    soft: string;
    /** #9CA3AF */
    placeholder: string;
    /** `black` icon/text. */
    black: string;
    /** CSS `grey` (#808080) placeholder text. */
    grey: string;
  };
  grey: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  background: { default: string; paper: string };
  surface: {
    /** Page canvas (white today). */
    base: string;
    /** Cards, inputs, tiles (white today). */
    main: string;
    /** Inputs/cards sitting inside a modal (white today). */
    inset: string;
    /** #F8F8FA header tint. */
    header: string;
    /** #FAFAFA read-only field box on a card. */
    field: string;
    /** #F9F9F9 */
    subtle: string;
    /** #F2F2F2 */
    muted: string;
    /** #F3F4F6 avatar placeholder. */
    avatar: string;
    /** #DBE9F9 light-blue tint. */
    tint: string;
    /** #FAFCFF dashed empty-state fill. */
    tintFaint: string;
    /** #FFF4E8 warning/notice fill. */
    warning: string;
    /** Small icon buttons (#EDEDED today). */
    iconButton: string;
    /** #EEF6FF row/card hover. */
    hover: string;
    /** Selected row/card. */
    selected: string;
    /** Translucent white loading veil. */
    veil: string;
    /** #DCDCDC hover of the grey1 button. */
    pressed: string;
    /** #E5E7EB disabled button / empty avatar fill. */
    disabled: string;
  };
  border: {
    /** #E0E0E0 inputs/cards. */
    field: string;
    /** #E8E9EB nav/section dividers. */
    layout: string;
    /** #E5E7EB header edge. */
    header: string;
    /** #EDEDED hairlines. */
    divider: string;
    /** #EEE */
    light: string;
    /** #E6E6E6 */
    soft: string;
    /** #D7D7D7 */
    input: string;
    /** #D1D5DB */
    avatar: string;
    /** lightgray (#D3D3D3) modal header rule. */
    modal: string;
    /** #B8CDF5 dashed empty-state border. */
    dashed: string;
  };
  accent: {
    /** #337AEA links/icons. */
    link: string;
    /** Contained primary button background. */
    button: string;
    /** Label color on the contained primary button. */
    onButton: string;
    /** #FF3E3E destructive actions. */
    danger: string;
  };
  scrollbar: { track: string; thumb: string };
  /** Widget "Pulso" de /home (Figma 6642:25207 / 6621:22856). */
  pulse: {
    /** #F6F8FB panel canvas. */
    canvas: string;
    /** #0F1B3D numbers and titles. */
    ink: string;
    /** rgba(15,27,61,0.8) sub-labels. */
    inkSoft: string;
    /** #6B7791 secondary copy and icons. */
    muted: string;
    /** #EEF0F5 hairlines between rows. */
    divider: string;
    /** #CDDAFC rail sparkline bars. */
    sparkTrack: string;
    /** #1F5CFF rail sparkline current day + live dot. */
    sparkAccent: string;
    /** #FDC21C QR source. */
    qr: string;
  };
  shadow: {
    /** rgba(0,0,0,0.2) popup menus. */
    menu: string;
    /** rgba(194,194,194,0.6) card/menu glow. */
    soft: string;
    /** rgba(0,0,0,0.02) hairline. */
    hairline: string;
  };
}

/** Same value in every scheme: brand, promo badges, media accents. */
export const fixedColors = {
  white: "#FFFFFF",
  black: "#000000",
  stopperFavorite: "#FFD401",
  unavailable: "#BDBDBD",
  discount: "#E53935",
  multibuy: "#1E5BE8",
  stopperFavoriteText: "#4B4B4B",
  stopperFavoriteTextCard: "#333333",
  mediaFallback: "#4B4B4B",
  radioDot: "#FFD600",
  video: "#EE84F8",
  scrim: "rgba(0, 0, 0, 0.4)",
} as const;

export type FixedColors = typeof fixedColors;

const light: SchemeColors = {
  primary: {
    main: "#2563EB", // Primary color
    dark: "#2962CB", // Primary hover
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#E8F3FF", // Secondary color
  },
  error: {
    main: "#F64848", // Error color
    light: "#FFEAEA", // Error background
  },
  success: {
    main: "#219F5E", // Success color
    light: "#C8F6CD", // Success background
  },
  text: {
    primary: "#374151", // Primary text color
    secondary: "#333333", // Logos text color
    disabled: "#6B7280", // Placeholder text color
    strong: "#333333",
    heading: "#292929",
    title: "#4B4B4B",
    body: "#4F4F4F",
    muted: "#828282",
    faint: "#757575",
    soft: "#4A4A4A",
    placeholder: "#9CA3AF",
    black: "#000000",
    grey: "#808080",
  },
  grey: {
    50: "#FAFAFA",
    100: "#FFFFFF", // Background for inputs with data
    200: "#EEEEEE", // MUI default, made explicit
    300: "#E0E0E0", // MUI default, made explicit
    400: "#EDEDED", // Hover color for grey-600 elements
    500: "#9E9E9E", // MUI default, made explicit
    600: "#E6E6E6", // Config buttons background (non-primary)
    700: "#616161", // MUI default, made explicit
    800: "#AEB7C4", // Input borders
    900: "#9E9EA6", // Placeholder text color
  },
  background: {
    default: "#FFFFFF", // App background (light theme)
    paper: "#F5F5F5", // Paper background
  },
  surface: {
    base: "#FFFFFF",
    main: "#FFFFFF",
    inset: "#FFFFFF",
    header: "#F8F8FA",
    field: "#FAFAFA",
    subtle: "#F9F9F9",
    muted: "#F2F2F2",
    avatar: "#F3F4F6",
    tint: "#DBE9F9",
    tintFaint: "#FAFCFF",
    warning: "#FFF4E8",
    iconButton: "#EDEDED",
    hover: "#EEF6FF",
    selected: "#E8F3FF",
    veil: "rgba(255, 255, 255, 0.8)",
    pressed: "#DCDCDC",
    disabled: "#E5E7EB",
  },
  border: {
    field: "#E0E0E0",
    layout: "#E8E9EB",
    header: "#E5E7EB",
    divider: "#EDEDED",
    light: "#EEEEEE",
    soft: "#E6E6E6",
    input: "#D7D7D7",
    avatar: "#D1D5DB",
    modal: "#D3D3D3",
    dashed: "#B8CDF5",
  },
  accent: {
    link: "#337AEA",
    button: "#2563EB",
    onButton: "#FFFFFF",
    danger: "#FF3E3E",
  },
  scrollbar: { track: "#F1F1F1", thumb: "#C1C1C1" },
  pulse: {
    canvas: "#F6F8FB",
    ink: "#0F1B3D",
    inkSoft: "rgba(15, 27, 61, 0.8)",
    muted: "#6B7791",
    divider: "#EEF0F5",
    sparkTrack: "#CDDAFC",
    sparkAccent: "#1F5CFF",
    qr: "#FDC21C",
  },
  shadow: {
    menu: "rgba(0, 0, 0, 0.2)",
    soft: "rgba(194, 194, 194, 0.6)",
    hairline: "rgba(0, 0, 0, 0.02)",
  },
};

const dark: SchemeColors = {
  primary: {
    main: "#2E6FF2", // Figma (modo oscuro): prices, links, counters
    dark: "#3D7CF4", // Figma (modo oscuro): primary button hover
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#1B2F4B", // Figma (modo oscuro): tinted chip/background
  },
  error: {
    main: "#F64848", // Figma (modo oscuro): status text
    light: "#40202A", // Figma (modo oscuro): inactive stopper fill
  },
  success: {
    main: "#219F5E",
    light: "#0F2E1F", // (proposal) success background
  },
  text: {
    primary: "#C5CEDA", // Figma (modo oscuro): body text
    secondary: "#F8FAFC", // Figma (modo oscuro): headings / business name
    disabled: "#8290A3", // Figma (modo oscuro): faint text
    strong: "#F8FAFC",
    heading: "#F8FAFC",
    title: "#F8FAFC",
    body: "#C5CEDA",
    muted: "#8FA0B5", // Figma (modo oscuro): secondary text, neutral icons
    faint: "#8290A3",
    soft: "#C5CEDA",
    placeholder: "#8290A3",
    black: "#F8FAFC",
    grey: "#8FA0B5",
  },
  grey: {
    50: "#14233A",
    100: "#14233A", // Figma (modo oscuro): inputs
    200: "#20324B",
    300: "#263C57",
    400: "#20324B",
    500: "#8290A3",
    600: "#20324B", // Figma (modo oscuro): secondary button
    700: "#8FA0B5",
    800: "#263C57", // Figma (modo oscuro): border
    900: "#8FA0B5",
  },
  background: {
    default: "#0B1422", // Figma (modo oscuro): page canvas
    paper: "#14233A", // Figma (modo oscuro): cards, modals, menus
  },
  surface: {
    base: "#0B1422", // Figma (modo oscuro)
    main: "#14233A", // Figma (modo oscuro)
    inset: "#0F1C2F", // Figma (modo oscuro): filter-bar inset
    header: "#0B1422",
    field: "#0F1C2F",
    subtle: "#14233A",
    muted: "#20324B",
    avatar: "#0E192B", // Figma (modo oscuro)
    tint: "#1B2F4B",
    tintFaint: "#0B1422",
    warning: "#3B2A12", // (proposal)
    iconButton: "#20324B",
    hover: "#1B2D47", // Figma (modo oscuro): input/dropdown hover
    selected: "#1B2F4B",
    veil: "rgba(11, 20, 34, 0.8)",
    pressed: "#203A5D", // Figma (modo oscuro)
    disabled: "#14233A",
  },
  border: {
    field: "#263C57", // Figma (modo oscuro)
    layout: "#263C57",
    header: "#263C57",
    divider: "#263C57",
    light: "#263C57",
    soft: "#263C57",
    input: "#263C57",
    avatar: "#263C57",
    modal: "#263C57",
    dashed: "#36577C", // Figma (modo oscuro): hover border
  },
  accent: {
    link: "#2E6FF2", // Figma (modo oscuro)
    button: "#3077F0", // Figma (modo oscuro): primary button background
    onButton: "#FFFFFF", // Figma (modo oscuro): "Agregar producto" label
    danger: "#FF3E3E", // Figma (modo oscuro): danger badge
  },
  scrollbar: { track: "#14233A", thumb: "#263C57" },
  // (proposal) el widget Pulso solo tiene diseño en modo claro.
  pulse: {
    canvas: "#0F1C2F",
    ink: "#F8FAFC",
    inkSoft: "rgba(248, 250, 252, 0.8)",
    muted: "#8FA0B5",
    divider: "#263C57",
    sparkTrack: "#36577C",
    sparkAccent: "#2E6FF2",
    qr: "#FDC21C",
  },
  shadow: {
    menu: "rgba(0, 0, 0, 0.5)", // (proposal)
    soft: "rgba(0, 0, 0, 0.5)", // (proposal)
    hairline: "rgba(0, 0, 0, 0.3)", // (proposal)
  },
};

const colors = { light, dark };

export default colors;
