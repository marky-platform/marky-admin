import {
  getAllergenLabels,
  getCeliacDeclarations,
  getPresentationRows,
} from "./productDetailFormat";
import { CeliacInfo, ProductPresentation } from "../types/product";

const presentation = (
  overrides: Partial<ProductPresentation>,
): ProductPresentation => ({
  version: 1,
  amount: null,
  dimensions: null,
  approximateYield: null,
  ...overrides,
});

describe("getPresentationRows", () => {
  it("returns nothing for missing or empty presentations", () => {
    expect(getPresentationRows(null)).toEqual([]);
    expect(getPresentationRows(undefined)).toEqual([]);
    expect(getPresentationRows(presentation({}))).toEqual([]);
  });

  it("formats weight and volume with a decimal comma", () => {
    expect(
      getPresentationRows(
        presentation({ amount: { type: "weight", value: 1.5, unit: "kg" } }),
      ),
    ).toEqual([{ label: "Peso", value: "1,5 kg" }]);
    expect(
      getPresentationRows(
        presentation({ amount: { type: "volume", value: 500, unit: "ml" } }),
      ),
    ).toEqual([{ label: "Volumen", value: "500 ml" }]);
    expect(
      getPresentationRows(
        presentation({ amount: { type: "volume", value: 1, unit: "l" } }),
      ),
    ).toEqual([{ label: "Volumen", value: "1 L" }]);
  });

  it("pluralizes units", () => {
    const rows = (value: number) =>
      getPresentationRows(
        presentation({ amount: { type: "units", value, unit: null } }),
      );
    expect(rows(1)).toEqual([{ label: "Cantidad", value: "1 unidad" }]);
    expect(rows(12)).toEqual([{ label: "Cantidad", value: "12 unidades" }]);
  });

  it("skips an amount that has no unit or a non-positive value", () => {
    expect(
      getPresentationRows(
        presentation({ amount: { type: "weight", value: 2, unit: null } }),
      ),
    ).toEqual([]);
    expect(
      getPresentationRows(
        presentation({ amount: { type: "units", value: 0, unit: null } }),
      ),
    ).toEqual([]);
  });

  it("formats round and rectangular dimensions without dangling separators", () => {
    expect(
      getPresentationRows(
        presentation({
          dimensions: {
            shape: "round",
            diameterCm: 22,
            lengthCm: null,
            widthCm: null,
            heightCm: null,
          },
        }),
      ),
    ).toEqual([{ label: "Tamaño", value: "22 cm de diámetro" }]);
    expect(
      getPresentationRows(
        presentation({
          dimensions: {
            shape: "round",
            diameterCm: 22,
            lengthCm: null,
            widthCm: null,
            heightCm: 6.5,
          },
        }),
      ),
    ).toEqual([
      { label: "Tamaño", value: "22 cm de diámetro × 6,5 cm de alto" },
    ]);
    expect(
      getPresentationRows(
        presentation({
          dimensions: {
            shape: "rectangular",
            diameterCm: null,
            lengthCm: 30,
            widthCm: 20,
            heightCm: 6,
          },
        }),
      ),
    ).toEqual([{ label: "Tamaño", value: "30 × 20 × 6 cm" }]);
    expect(
      getPresentationRows(
        presentation({
          dimensions: {
            shape: "rectangular",
            diameterCm: null,
            lengthCm: 30,
            widthCm: null,
            heightCm: 6,
          },
        }),
      ),
    ).toEqual([{ label: "Tamaño", value: "30 × 6 cm" }]);
  });

  it("omits dimensions with no usable measure", () => {
    expect(
      getPresentationRows(
        presentation({
          dimensions: {
            shape: "round",
            diameterCm: null,
            lengthCm: null,
            widthCm: null,
            heightCm: null,
          },
        }),
      ),
    ).toEqual([]);
  });

  it("formats the stored yield as a range, singular or plural", () => {
    const rows = (min: number, max: number | null) =>
      getPresentationRows(
        presentation({ approximateYield: { minPeople: min, maxPeople: max } }),
      );
    expect(rows(12, 15)).toEqual([
      { label: "Rendimiento", value: "12–15 personas" },
    ]);
    expect(rows(1, null)).toEqual([
      { label: "Rendimiento", value: "1 persona" },
    ]);
    expect(rows(4, null)).toEqual([
      { label: "Rendimiento", value: "4 personas" },
    ]);
    expect(rows(4, 4)).toEqual([{ label: "Rendimiento", value: "4 personas" }]);
  });

  it("keeps the amount, size, yield order when everything is set", () => {
    const rows = getPresentationRows(
      presentation({
        amount: { type: "volume", value: 500, unit: "ml" },
        dimensions: {
          shape: "round",
          diameterCm: 8,
          lengthCm: null,
          widthCm: null,
          heightCm: null,
        },
        approximateYield: { minPeople: 1, maxPeople: null },
      }),
    );
    expect(rows.map((r) => r.label)).toEqual([
      "Volumen",
      "Tamaño",
      "Rendimiento",
    ]);
  });
});

describe("getAllergenLabels", () => {
  it("maps known ids to labels and ignores unknown or missing input", () => {
    expect(getAllergenLabels(["tree_nuts", "milk", "mystery", "egg"])).toEqual([
      "Frutos secos",
      "Leche",
      "Huevo",
    ]);
    expect(getAllergenLabels([])).toEqual([]);
    expect(getAllergenLabels(null)).toEqual([]);
    expect(getAllergenLabels(undefined)).toEqual([]);
  });
});

describe("getCeliacDeclarations", () => {
  const info = (overrides: Partial<CeliacInfo>): CeliacInfo => ({
    version: 1,
    crossContaminationControl: false,
    glutenFreeGrains: false,
    certifiedProtocol: false,
    ...overrides,
  });

  it("returns nothing when disabled", () => {
    expect(getCeliacDeclarations(null)).toEqual([]);
    expect(getCeliacDeclarations(undefined)).toEqual([]);
    expect(getCeliacDeclarations(info({}))).toEqual([]);
  });

  it("lists only the true flags in design order", () => {
    expect(
      getCeliacDeclarations(
        info({ certifiedProtocol: true, glutenFreeGrains: true }),
      ),
    ).toEqual([
      "Sin trigo, avena, cebada ni centeno",
      "Protocolo declarado o certificación*",
    ]);
  });
});
