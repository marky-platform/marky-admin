import { ALLERGENS } from "../constants/allergens";
import { CeliacInfo, ProductPresentation } from "../types/product";
import { formatLocaleDecimal } from "./parseLocaleDecimal";

// Formateo de solo lectura (página de detalle) de los datos descriptivos del
// producto. El backend puede devolver datos viejos o editados a mano, así que
// cada valor se valida y, si falta o es inválido, la fila simplemente no se
// muestra (nunca "null", etiquetas vacías ni separadores sueltos).

export interface DetailRow {
  label: string;
  value: string;
}

const isPositive = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n) && n > 0;

const measure = (n: number) => formatLocaleDecimal(n);

const amountRow = (
  amount: ProductPresentation["amount"] | undefined,
): DetailRow | null => {
  if (!amount || !isPositive(amount.value)) return null;
  const value = measure(amount.value);

  if (amount.type === "units") {
    return {
      label: "Cantidad",
      value: `${value} ${amount.value === 1 ? "unidad" : "unidades"}`,
    };
  }
  if (!amount.unit) return null;
  if (amount.type === "weight") {
    return { label: "Peso", value: `${value} ${amount.unit}` };
  }
  if (amount.type === "volume") {
    return {
      label: "Volumen",
      value: `${value} ${amount.unit === "l" ? "L" : amount.unit}`,
    };
  }
  return null;
};

const dimensionsRow = (
  dimensions: ProductPresentation["dimensions"] | undefined,
): DetailRow | null => {
  if (!dimensions) return null;
  const { shape, diameterCm, lengthCm, widthCm, heightCm } = dimensions;

  if (shape === "round") {
    const parts: string[] = [];
    if (isPositive(diameterCm))
      parts.push(`${measure(diameterCm)} cm de diámetro`);
    if (isPositive(heightCm)) parts.push(`${measure(heightCm)} cm de alto`);
    return parts.length ? { label: "Tamaño", value: parts.join(" × ") } : null;
  }

  if (shape === "rectangular") {
    const sides = [lengthCm, widthCm, heightCm].filter(isPositive).map(measure);
    return sides.length
      ? { label: "Tamaño", value: `${sides.join(" × ")} cm` }
      : null;
  }
  return null;
};

const yieldRow = (
  approximateYield: ProductPresentation["approximateYield"] | undefined,
): DetailRow | null => {
  if (!approximateYield || !isPositive(approximateYield.minPeople)) return null;
  const { minPeople, maxPeople } = approximateYield;
  if (isPositive(maxPeople) && maxPeople > minPeople) {
    return {
      label: "Rendimiento",
      value: `${minPeople}–${maxPeople} personas`,
    };
  }
  return {
    label: "Rendimiento",
    value: `${minPeople} ${minPeople === 1 ? "persona" : "personas"}`,
  };
};

export const getPresentationRows = (
  presentation: ProductPresentation | null | undefined,
): DetailRow[] => {
  if (!presentation || typeof presentation !== "object") return [];
  return [
    amountRow(presentation.amount),
    dimensionsRow(presentation.dimensions),
    yieldRow(presentation.approximateYield),
  ].filter((row): row is DetailRow => row !== null);
};

const ALLERGEN_LABELS = new Map(ALLERGENS.map((a) => [a.id, a.label]));

// Ids desconocidos (catálogo viejo/nuevo) se ignoran en lugar de mostrarse crudos.
export const getAllergenLabels = (ids: string[] | null | undefined): string[] =>
  (Array.isArray(ids) ? ids : [])
    .map((id) => ALLERGEN_LABELS.get(id))
    .filter((label): label is string => Boolean(label));

// Orden y textos de la tarjeta "Apto para celíacos" del diseño. El asterisco de
// "Protocolo…" viene del Figma.
const CELIAC_DECLARATIONS: {
  key: Exclude<keyof CeliacInfo, "version">;
  label: string;
}[] = [
  { key: "glutenFreeGrains", label: "Sin trigo, avena, cebada ni centeno" },
  {
    key: "crossContaminationControl",
    label: "Control de contaminación cruzada",
  },
  { key: "certifiedProtocol", label: "Protocolo declarado o certificación*" },
];

export const getCeliacDeclarations = (
  celiacInfo: CeliacInfo | null | undefined,
): string[] =>
  celiacInfo
    ? CELIAC_DECLARATIONS.filter(({ key }) => celiacInfo[key] === true).map(
        ({ label }) => label,
      )
    : [];
