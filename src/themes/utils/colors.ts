// src/themes/utils/colors.ts
//
// Single source of truth for every color scheme. `light` values are exactly
// the literals the app used before dark mode existed (1:1, no merging of
// near-identical greys). `dark` values come from the Figma "Home con datos"
// dark frame; values marked (proposal) are not covered by the design and
// need the checkpoint-1 / pilot approval. See DARK-MODE-PLAN-2026-10-11.md.
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
  shadow: {
    menu: "rgba(0, 0, 0, 0.2)",
    soft: "rgba(194, 194, 194, 0.6)",
    hairline: "rgba(0, 0, 0, 0.02)",
  },
};

const dark: SchemeColors = {
  primary: {
    main: "#3C74ED", // Figma: prices, links, counters
    dark: "#3C74ED", // (proposal) hover for the #4A88EC button
    contrastText: "#FFFFFF", // other primary fills (chips, badges…) keep white text
  },
  secondary: {
    main: "#1E3A5F", // (proposal) tinted chip/background
  },
  error: {
    main: "#F76060", // Figma: status text
    light: "#3B1219", // (proposal) error background
  },
  success: {
    main: "#219F5E",
    light: "#0F2E1F", // (proposal) success background
  },
  text: {
    primary: "#CBD5E1", // Figma: body text
    secondary: "#FFFFFF", // Figma: headings / business name
    disabled: "#64748B", // (proposal) slate-500
    strong: "#FFFFFF",
    heading: "#FFFFFF",
    title: "#FFFFFF",
    body: "#CBD5E1",
    muted: "#9E9EA6", // Figma
    faint: "#9E9EA6",
    soft: "#CBD5E1", // (proposal)
    placeholder: "#64748B", // (proposal)
    black: "#FFFFFF", // (proposal)
    grey: "#9E9EA6", // (proposal)
  },
  grey: {
    50: "#1E293B", // Figma surface.main
    100: "#1E293B", // Figma surface.main (inputs)
    200: "#2A2F36", // (proposal) raised fill
    300: "#334155", // (proposal) border-ish
    400: "#2A2F36", // Figma surface.button
    500: "#64748B", // (proposal)
    600: "#2A2F36", // Figma surface.button
    700: "#94A3B8", // (proposal)
    800: "#334155", // Figma border.field
    900: "#9E9EA6", // Figma text.muted
  },
  background: {
    default: "#0F172A", // Figma: page, nav, sidebar
    paper: "#1E293B", // (proposal) modals, menus
  },
  surface: {
    base: "#0F172A", // Figma
    main: "#1E293B", // Figma
    inset: "#0F172A", // (proposal) layer rule
    header: "#0F172A", // Figma: top nav
    field: "#0F172A", // (proposal) inset on a #1E293B card
    subtle: "#1E293B", // (proposal)
    muted: "#2A2F36", // (proposal)
    avatar: "#1E293B", // Figma: avatar
    tint: "#1E3A5F", // (proposal)
    tintFaint: "#0F172A", // (proposal)
    warning: "#3B2A12", // (proposal)
    iconButton: "#121212", // Figma
    hover: "rgba(74, 136, 236, 0.12)", // (proposal)
    selected: "rgba(74, 136, 236, 0.2)", // (proposal)
    veil: "rgba(15, 23, 42, 0.8)", // (proposal)
    pressed: "#334155", // (proposal)
    disabled: "#1E293B", // (proposal)
  },
  border: {
    field: "#334155", // Figma
    layout: "#1F2228", // Figma
    header: "#1F2228", // Figma
    divider: "#1F2228", // Figma
    light: "#334155", // (proposal)
    soft: "#334155", // (proposal)
    input: "#334155", // (proposal)
    avatar: "#334155", // (proposal)
    modal: "#334155", // (proposal)
    dashed: "#2F4F8F", // (proposal)
  },
  accent: {
    link: "#3C74ED", // Figma
    button: "#4A88EC", // Figma: primary button background
    onButton: "#0D0D0D", // Figma: "Agregar producto" label
    danger: "#F76060", // (proposal)
  },
  scrollbar: { track: "#1E293B", thumb: "#334155" }, // (proposal)
  shadow: {
    menu: "rgba(0, 0, 0, 0.5)", // (proposal)
    soft: "rgba(0, 0, 0, 0.5)", // (proposal)
    hairline: "rgba(0, 0, 0, 0.3)", // (proposal)
  },
};

const colors = { light, dark };

export default colors;
