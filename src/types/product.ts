export type MediaType = "image" | "video";

// Derived server-side (products/promotions.py) from promotion_starts_at /
// promotion_ends_at / whether a discount or multibuy is configured — never
// stored as a separate flag. See Asana ticket #8: this is the single source
// of truth every promo surface (card, quick modal, edit form) renders from.
export type PromotionStatus = "active" | "scheduled" | "expired" | "inactive";

export interface MediaItemLocal {
  id?: number; // present for existing media
  file: File | string; // File when new, string URL when existing
  originalFile?: string; // optional backup of remote URL
  name?: string;
  media_type: MediaType;
  product?: number;
  _delete?: boolean; // mark for deletion
  // order?: number | null;
}

export interface ProductGridItem {
  id: string | number;
  name: string;
  /** Optional short description used in product cards */
  description?: string;
  image?: string;
  views?: number;
  price: string | number;
  priceAlt?: string | number;
  /** Fully formatted primary price coming from the backend (e.g. "PYG 80.000,00") */
  primaryPrice?: string;
  /** Fully formatted secondary price coming from the backend (e.g. "USD 10,53") */
  secondaryPrice?: string;
  /** Fully formatted primary price with an active discount applied (e.g. "PYG 60.000,00") */
  primaryPriceWithDiscount?: string;
  /** Fully formatted secondary price with an active discount applied (e.g. "USD 7,89") */
  secondaryPriceWithDiscount?: string;
  isRecommended?: boolean;
  isFavorite?: boolean;
  discountPercent?: number;

  // mapped from backend `multibuy_option`
  multibuyOption?: string | null;
  // mapped promotion dates (from productMapper)
  promotionStartsAt?: string | null;
  promotionEndsAt?: string | null;
  promotionStatus?: PromotionStatus;
  // availability fields forwarded from backend mapper
  is_available?: boolean;
  is_active?: boolean;
}

export interface ProductVariant {
  id?: number;
  name: string;
  description?: string;
  price: number;
  //
  image?: File | string; // same pattern: File when new, URL when existing
  primaryPrice?: string;
  secondaryPrice?: string;
  _delete?: boolean;
}

export interface ProductAddon {
  id?: number;
  name: string;
  price: number;
  _delete?: boolean;
}

export type AmountType = "units" | "weight" | "volume";
export type AmountUnit = "g" | "kg" | "ml" | "l";
export type DimensionShape = "round" | "rectangular";

// Forma persistida (versionada) del campo `presentation` del backend.
export interface ProductPresentation {
  version: 1;
  amount: { type: AmountType; value: number; unit: AmountUnit | null } | null;
  dimensions: {
    shape: DimensionShape;
    diameterCm: number | null;
    lengthCm: number | null;
    widthCm: number | null;
    heightCm: number | null;
  } | null;
  approximateYield: { minPeople: number; maxPeople: number | null } | null;
}

// Forma persistida del campo `celiac_info` (null = switch apagado).
export interface CeliacInfo {
  version: 1;
  crossContaminationControl: boolean;
  glutenFreeGrains: boolean;
  certifiedProtocol: boolean;
}

// Estado del formulario para "Presentación": todo texto para poder aceptar
// la coma decimal; se convierte a números solo al enviar.
export interface PresentationFormState {
  amountEnabled: boolean;
  amountType: AmountType;
  amountValue: string;
  amountUnit: AmountUnit;
  dimensionsEnabled: boolean;
  shape: DimensionShape;
  diameterCm: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  yieldEnabled: boolean;
  minPeople: string;
  maxPeople: string;
}

export interface CeliacFormState {
  enabled: boolean;
  crossContaminationControl: boolean;
  glutenFreeGrains: boolean;
  certifiedProtocol: boolean;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: { id: number; name: string } | null;
  // New field to represent availability separate from legacy `is_active`.
  // This field may be provided by the API as `is_available` in some cases.
  is_available?: boolean;
  is_active: boolean;
  variants: ProductVariant[];
  addons: ProductAddon[];
  stopper?: "FAVORITE" | "RECOMMENDED" | "";
  isPromotionActive?: boolean;
  promotionOption?: "descuento" | "oferta" | "";
  discountPercentage?: number;
  multibuyOption?: "2x1" | "3x2" | "";
  countdownActive?: boolean;
  promotionStartDate?: string;
  promotionStartTime?: string;
  promotionEndDate?: string;
  promotionEndTime?: string;
  promotionStatus?: PromotionStatus;
  media?: MediaItemLocal[];
  // Datos informativos opcionales. `featuredIngredients`/`allergens` son
  // arrays en el frontend (CSV en la API); `presentation`/`celiacInfo` es lo
  // que llega de la API, y `presentationForm`/`celiacForm` el estado editable.
  featuredIngredients?: string[];
  allergens?: string[];
  presentation?: ProductPresentation | null;
  celiacInfo?: CeliacInfo | null;
  presentationForm?: PresentationFormState;
  celiacForm?: CeliacFormState;
  primaryPrice?: string;
  secondaryPrice?: string;
  /** Fully formatted primary price with discount coming from the backend (e.g. "PYG 60.000,00") */
  primaryPriceWithDiscount?: string;
  /** Fully formatted secondary price with discount coming from the backend (e.g. "USD 7,89") */
  secondaryPriceWithDiscount?: string;
  // media?: {
  //   id: number;
  //   file: string;
  //   originalFile?: string;
  //   name?: string;
  //   media_type: "image" | "video";
  //   product: number;
  // }[];
}
