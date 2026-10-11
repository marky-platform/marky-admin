import logoLight from "../assets/images/marky-logo.svg";
import logoDark from "../assets/images/marky-logo-dark.svg";
import logoPngLight from "../assets/images/marky-logo.png";
import logoPngDark from "../assets/images/marky-logo-dark.png";
import defaultAvatarLight from "../assets/images/marky-m-gray-logo.png";
import defaultAvatarDark from "../assets/images/marky-m-gray-logo-dark.png";
import allergenInfoLight from "../assets/icons/product-form/allergen-info.svg";
import allergenInfoDark from "../assets/icons/product-form/allergen-info-dark.svg";
import glutenFreeLight from "../assets/icons/product-form/gluten-free.svg";
import glutenFreeDark from "../assets/icons/product-form/gluten-free-dark.svg";
import glutenFreeBadgeLight from "../assets/icons/product-form/gluten-free-badge.svg";
import glutenFreeBadgeDark from "../assets/icons/product-form/gluten-free-badge-dark.svg";
import allergensBadgeLight from "../assets/icons/product-detail/allergens-badge.svg";
import allergensBadgeDark from "../assets/icons/product-detail/allergens-badge-dark.svg";
import celiacBadgeLight from "../assets/icons/product-detail/celiac-badge.svg";
import celiacBadgeDark from "../assets/icons/product-detail/celiac-badge-dark.svg";
import type { ColorSchemeName } from "./theme";

// Everything that varies per color scheme and can't be expressed as a palette
// token lives here, keyed by scheme name (Record => a new scheme that forgets
// an entry is a TypeScript error). Components read it through
// `useThemeAssets()` and never branch on the mode name.
//
// Inline-SVG icons (`ReactComponent`) are recolored with CSS instead: see the
// `.mono-icon` rules in utils/components.ts. Only `<img src>` assets and
// non-SVG files need an entry here.
export interface ThemeAssets {
  /** Marky wordmark (SVG, 110x22). */
  logo: string;
  /** Marky wordmark (PNG, 110x24) used by the auth screens. */
  logoPng: string;
  /** Default business avatar placeholder (PNG, 32x26). */
  defaultAvatar: string;
  /** Allergen info icon used as `<img>` in the product form (24x24). */
  allergenInfoIcon: string;
  /** Gluten-free icon used as `<img>` in the product form (24x24). */
  glutenFreeIcon: string;
  /** Gluten-free round badge (40x40, product form). */
  glutenFreeBadge: string;
  /** Allergens round badge (40x40, product detail). */
  allergensBadge: string;
  /** Celiac round badge (40x40, product detail). */
  celiacBadge: string;
  /** react-toastify `theme` option. */
  toastTheme: "light" | "dark" | "colored";
  /**
   * `theme` of the ToastContainer: applies to toasts fired directly with
   * `toast.success(...)` (no per-toast theme). Light keeps the library default.
   */
  toastContainerTheme: "light" | "dark" | "colored";
}

export const themeAssets: Record<ColorSchemeName, ThemeAssets> = {
  light: {
    logo: logoLight,
    logoPng: logoPngLight,
    defaultAvatar: defaultAvatarLight,
    allergenInfoIcon: allergenInfoLight,
    glutenFreeIcon: glutenFreeLight,
    glutenFreeBadge: glutenFreeBadgeLight,
    allergensBadge: allergensBadgeLight,
    celiacBadge: celiacBadgeLight,
    toastTheme: "dark",
    toastContainerTheme: "light",
  },
  dark: {
    logo: logoDark,
    logoPng: logoPngDark,
    defaultAvatar: defaultAvatarDark,
    allergenInfoIcon: allergenInfoDark,
    glutenFreeIcon: glutenFreeDark,
    glutenFreeBadge: glutenFreeBadgeDark,
    allergensBadge: allergensBadgeDark,
    celiacBadge: celiacBadgeDark,
    toastTheme: "dark",
    toastContainerTheme: "dark",
  },
};
