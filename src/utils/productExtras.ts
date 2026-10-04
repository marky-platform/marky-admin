import * as Yup from "yup";
import { ALLERGENS, isKnownAllergenId } from "../constants/allergens";
import {
  AmountUnit,
  CeliacFormState,
  CeliacInfo,
  PresentationFormState,
  Product,
  ProductPresentation,
} from "../types/product";
import { formatLocaleDecimal, parseLocaleDecimal } from "./parseLocaleDecimal";

export const MAX_FEATURED_INGREDIENTS = 8;
export const MAX_INGREDIENT_LENGTH = 50;
// Mismos límites que el backend (products/product_extras.py).
export const MIN_MEASURE = 0.001;
export const MAX_MEASURE = 1_000_000;
export const MAX_PEOPLE = 1000;

// ---------------------------------------------------------------------------
// CSV (ingredientes destacados y alérgenos). El backend guarda un string
// separado por comas; el formulario trabaja con arrays.
// ---------------------------------------------------------------------------

export const parseCsvList = (csv: string | null | undefined): string[] =>
  csv
    ? csv
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

export const serializeCsvList = (items: string[]): string => items.join(",");

export type AddIngredientResult = { list: string[]; error?: string };

// Agrega un ingrediente respetando: trim, no vacío, sin comas, sin duplicados
// (insensible a mayúsculas), máximo 8 y orden/ortografía elegidos.
export const addFeaturedIngredient = (
  current: string[],
  raw: string,
): AddIngredientResult => {
  const value = raw.trim();
  if (!value) return { list: current };
  if (value.includes(",")) {
    return { list: current, error: "Los ingredientes no pueden contener comas" };
  }
  if (value.length > MAX_INGREDIENT_LENGTH) {
    return {
      list: current,
      error: `Máximo ${MAX_INGREDIENT_LENGTH} caracteres por ingrediente`,
    };
  }
  if (current.some((i) => i.toLowerCase() === value.toLowerCase())) {
    return { list: current, error: "Ese ingrediente ya fue agregado" };
  }
  if (current.length >= MAX_FEATURED_INGREDIENTS) {
    return {
      list: current,
      error: `Puedes destacar hasta ${MAX_FEATURED_INGREDIENTS} ingredientes`,
    };
  }
  return { list: [...current, value] };
};

// Ids desconocidos (datos legacy) se descartan: el backend rechaza ids fuera
// del catálogo, así que conservarlos haría fallar el guardado.
export const parseAllergenIds = (csv: string | null | undefined): string[] =>
  Array.from(new Set(parseCsvList(csv).filter(isKnownAllergenId)));

// Serialización determinista: orden del catálogo.
export const serializeAllergenIds = (ids: string[]): string =>
  ALLERGENS.filter((a) => ids.includes(a.id))
    .map((a) => a.id)
    .join(",");

// ---------------------------------------------------------------------------
// Presentación
// ---------------------------------------------------------------------------

export const defaultPresentationForm = (): PresentationFormState => ({
  amountEnabled: false,
  amountType: "units",
  amountValue: "",
  amountUnit: "g",
  dimensionsEnabled: false,
  shape: "round",
  diameterCm: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  yieldEnabled: false,
  minPeople: "",
  maxPeople: "",
});

export const presentationToForm = (
  presentation: ProductPresentation | null | undefined,
): PresentationFormState => {
  const form = defaultPresentationForm();
  if (!presentation) return form;
  const { amount, dimensions, approximateYield } = presentation;
  if (amount) {
    form.amountEnabled = true;
    form.amountType = amount.type;
    form.amountValue = formatLocaleDecimal(amount.value);
    if (amount.unit) form.amountUnit = amount.unit;
  }
  if (dimensions) {
    form.dimensionsEnabled = true;
    form.shape = dimensions.shape;
    form.diameterCm = formatLocaleDecimal(dimensions.diameterCm);
    form.lengthCm = formatLocaleDecimal(dimensions.lengthCm);
    form.widthCm = formatLocaleDecimal(dimensions.widthCm);
    form.heightCm = formatLocaleDecimal(dimensions.heightCm);
  }
  if (approximateYield) {
    form.yieldEnabled = true;
    form.minPeople = String(approximateYield.minPeople);
    form.maxPeople =
      approximateYield.maxPeople === null ? "" : String(approximateYield.maxPeople);
  }
  return form;
};

export const UNITS_BY_AMOUNT_TYPE: Record<"weight" | "volume", AmountUnit[]> = {
  weight: ["g", "kg"],
  volume: ["ml", "l"],
};

const parseOptional = (raw: string) =>
  raw.trim() === "" ? null : parseMeasure(raw);

// Formik convierte "" en undefined antes de validar: se tolera.
const parsePositiveInt = (
  raw: string | undefined,
  max = MAX_MEASURE,
): number | null => {
  const text = (raw ?? "").trim();
  if (!/^\d+$/.test(text)) return null;
  const value = Number(text);
  return value >= 1 && value <= max ? value : null;
};

const parseMeasure = (raw: string | undefined): number | null => {
  const value = parseLocaleDecimal(raw ?? "");
  return value !== null && value >= MIN_MEASURE && value <= MAX_MEASURE
    ? value
    : null;
};

// Convierte el estado del formulario al payload. Solo incluye módulos activos
// y los campos propios de la forma/tipo elegido (nada de valores obsoletos).
// Asume que el formulario ya pasó la validación; un módulo inválido se omite.
export const presentationFormToPayload = (
  form: PresentationFormState,
): ProductPresentation | null => {
  const payload: ProductPresentation = {
    version: 1,
    amount: null,
    dimensions: null,
    approximateYield: null,
  };

  if (form.amountEnabled) {
    const value =
      form.amountType === "units"
        ? parsePositiveInt(form.amountValue)
        : parseMeasure(form.amountValue);
    if (value !== null) {
      payload.amount = {
        type: form.amountType,
        value,
        unit: form.amountType === "units" ? null : form.amountUnit,
      };
    }
  }

  if (form.dimensionsEnabled) {
    const height = parseOptional(form.heightCm);
    if (form.shape === "round") {
      const diameter = parseMeasure(form.diameterCm);
      if (diameter !== null) {
        payload.dimensions = {
          shape: "round",
          diameterCm: diameter,
          lengthCm: null,
          widthCm: null,
          heightCm: height,
        };
      }
    } else {
      const length = parseMeasure(form.lengthCm);
      const width = parseMeasure(form.widthCm);
      if (length !== null && width !== null) {
        payload.dimensions = {
          shape: "rectangular",
          diameterCm: null,
          lengthCm: length,
          widthCm: width,
          heightCm: height,
        };
      }
    }
  }

  if (form.yieldEnabled) {
    const min = parsePositiveInt(form.minPeople, MAX_PEOPLE);
    if (min !== null) {
      const max =
        form.maxPeople.trim() === ""
          ? null
          : parsePositiveInt(form.maxPeople, MAX_PEOPLE);
      payload.approximateYield = { minPeople: min, maxPeople: max };
    }
  }

  return payload.amount || payload.dimensions || payload.approximateYield
    ? payload
    : null;
};

// Validación condicional: solo se validan módulos activos y los campos
// relevantes para la forma/tipo elegido.
const isRequiredPositiveDecimal = (raw: string | undefined) => parseMeasure(raw) !== null;
const isOptionalPositiveDecimal = (raw: string | undefined) =>
  (raw ?? "").trim() === "" || isRequiredPositiveDecimal(raw);

export const buildPresentationSchema = () =>
  Yup.object().shape({
    amountValue: Yup.string().test("amount", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.amountEnabled) return true;
      const v = value ?? "";
      if (p.amountType === "units") {
        return (
          parsePositiveInt(v) !== null ||
          this.createError({ message: "Ingresa un número entero mayor o igual a 1" })
        );
      }
      return (
        isRequiredPositiveDecimal(v) ||
        this.createError({ message: "Ingresa un número entre 0,001 y 1.000.000 (usa coma para decimales)" })
      );
    }),
    diameterCm: Yup.string().test("diameter", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.dimensionsEnabled || p.shape !== "round") return true;
      return (
        isRequiredPositiveDecimal(value ?? "") ||
        this.createError({ message: "El diámetro debe ser mayor a 0" })
      );
    }),
    lengthCm: Yup.string().test("length", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.dimensionsEnabled || p.shape !== "rectangular") return true;
      return (
        isRequiredPositiveDecimal(value ?? "") ||
        this.createError({ message: "El largo debe ser mayor a 0" })
      );
    }),
    widthCm: Yup.string().test("width", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.dimensionsEnabled || p.shape !== "rectangular") return true;
      return (
        isRequiredPositiveDecimal(value ?? "") ||
        this.createError({ message: "El ancho debe ser mayor a 0" })
      );
    }),
    heightCm: Yup.string().test("height", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.dimensionsEnabled) return true;
      return (
        isOptionalPositiveDecimal(value ?? "") ||
        this.createError({ message: "El alto debe ser mayor a 0" })
      );
    }),
    minPeople: Yup.string().test("min-people", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.yieldEnabled) return true;
      return (
        parsePositiveInt(value ?? "", MAX_PEOPLE) !== null ||
        this.createError({ message: `Ingresa un número entero entre 1 y ${MAX_PEOPLE}` })
      );
    }),
    maxPeople: Yup.string().test("max-people", function (value) {
      const p = this.parent as PresentationFormState;
      if (!p.yieldEnabled || (value ?? "").trim() === "") return true;
      const max = parsePositiveInt(value ?? "", MAX_PEOPLE);
      if (max === null) {
        return this.createError({ message: `Ingresa un número entero entre 1 y ${MAX_PEOPLE}` });
      }
      const min = parsePositiveInt(p.minPeople, MAX_PEOPLE);
      return (
        min === null ||
        max >= min ||
        this.createError({ message: "El máximo debe ser mayor o igual al mínimo" })
      );
    }),
  });

// ---------------------------------------------------------------------------
// SIN TACC
// ---------------------------------------------------------------------------

export const defaultCeliacForm = (): CeliacFormState => ({
  enabled: false,
  crossContaminationControl: false,
  glutenFreeGrains: false,
  certifiedProtocol: false,
});

export const celiacToForm = (info: CeliacInfo | null | undefined): CeliacFormState =>
  info
    ? {
        enabled: true,
        crossContaminationControl: info.crossContaminationControl === true,
        glutenFreeGrains: info.glutenFreeGrains === true,
        certifiedProtocol: info.certifiedProtocol === true,
      }
    : defaultCeliacForm();

// Normaliza el estado: con el switch apagado las tres declaraciones se
// limpian siempre (nunca se persisten valores ocultos).
export const normalizeCeliacForm = (form: CeliacFormState): CeliacFormState =>
  form.enabled ? form : defaultCeliacForm();

export const celiacFormToPayload = (form: CeliacFormState): CeliacInfo | null =>
  form.enabled
    ? {
        version: 1,
        crossContaminationControl: form.crossContaminationControl,
        glutenFreeGrains: form.glutenFreeGrains,
        certifiedProtocol: form.certifiedProtocol,
      }
    : null;

// ---------------------------------------------------------------------------
// Serialización para multipart (ver objectToFormData: descarta null y envía
// todo como string, por eso los JSON van como un único string y "" limpia).
// ---------------------------------------------------------------------------

const jsonOrEmpty = (value: unknown) =>
  value === null ? "" : JSON.stringify(value);

// Claves de estado de formulario / API que no deben viajar tal cual.
const EXTRAS_FORM_KEYS = [
  "featuredIngredients",
  "featured_ingredients",
  "allergens",
  "presentation",
  "presentationForm",
  "celiacInfo",
  "celiac_info",
  "celiacForm",
] as const;

export const stripProductExtrasKeys = (submissionValues: Record<string, unknown>) => {
  EXTRAS_FORM_KEYS.forEach((key) => delete submissionValues[key]);
};

export const buildProductExtrasFields = (
  values: Pick<Product, "featuredIngredients" | "allergens" | "presentationForm" | "celiacForm">,
): Record<string, string> => ({
  featured_ingredients: serializeCsvList(values.featuredIngredients ?? []),
  allergens: serializeAllergenIds(values.allergens ?? []),
  presentation: jsonOrEmpty(
    values.presentationForm ? presentationFormToPayload(values.presentationForm) : null,
  ),
  celiac_info: jsonOrEmpty(
    values.celiacForm ? celiacFormToPayload(normalizeCeliacForm(values.celiacForm)) : null,
  ),
});

// Qué enviar en `category`: objectToFormData descarta null, así que al editar
// un producto sin categoría hay que mandar "" para limpiarla en el backend.
export const buildCategoryPayload = (
  category: unknown,
  isEditing: boolean,
): number | string | null => {
  const id =
    category && typeof category === "object"
      ? (category as { id?: number }).id
      : (category as number | string | null | undefined);
  if (id === null || id === undefined || id === "") return isEditing ? "" : null;
  return id as number | string;
};
