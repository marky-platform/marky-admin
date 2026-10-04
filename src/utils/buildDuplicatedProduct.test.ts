import { buildDuplicatedProduct } from "./buildDuplicatedProduct";
import { Product } from "../types/product";

const baseProduct = (overrides: Partial<Product> = {}): Product =>
  ({
    id: 1,
    name: "Pizza",
    description: "desc",
    price: 100,
    variants: [],
    addons: [],
    ...overrides,
  }) as Product;

describe("buildDuplicatedProduct", () => {
  it("drops id, appends (copia), and clears media", () => {
    const result = buildDuplicatedProduct(baseProduct());

    expect(result.id).toBeUndefined();
    expect(result.name).toBe("Pizza (copia)");
    expect(result.media).toEqual([]);
  });

  it("strips variant/addon ids so they're created fresh on the duplicate", () => {
    const result = buildDuplicatedProduct(
      baseProduct({
        variants: [
          { id: 1, name: "Chico", price: 5, image: "https://example.com/a.jpg" },
        ] as any,
        addons: [{ id: 2, name: "Queso", price: 3 }] as any,
      }),
    );

    expect(result.variants[0]).not.toHaveProperty("id");
    expect((result.addons as any)[0]).not.toHaveProperty("id");
  });

  it("excludes variants/addons soft-deleted (but not yet saved) on the source form", () => {
    // Regression: VariationsSection/ExtrasSection soft-delete a persisted row
    // by flagging it `_delete: true` and hiding it, rather than splicing it
    // out immediately — the row only disappears from the array once the
    // pending save actually tombstones it server-side. Duplicating from live
    // (unsaved) Formik state must not resurrect that row as a normal one.
    const result = buildDuplicatedProduct(
      baseProduct({
        variants: [
          { id: 1, name: "Chico", price: 5, image: "https://example.com/a.jpg" },
          { id: 2, name: "Grande", price: 8, _delete: true } as any,
        ] as any,
        addons: [
          { id: 3, name: "Queso", price: 3 },
          { id: 4, name: "Tocino", price: 4, _delete: true } as any,
        ] as any,
      }),
    );

    expect(result.variants).toHaveLength(1);
    expect(result.variants[0]).toMatchObject({ name: "Chico" });
    expect(result.addons).toHaveLength(1);
    expect((result.addons as any)[0]).toMatchObject({ name: "Queso" });
  });

  it("copies the optional informational fields as form state", () => {
    const result = buildDuplicatedProduct(
      baseProduct({
        featuredIngredients: ["Tomate"],
        allergens: ["milk"],
        presentation: {
          version: 1,
          amount: null,
          dimensions: null,
          approximateYield: { minPeople: 4, maxPeople: null },
        },
        celiacInfo: {
          version: 1,
          crossContaminationControl: true,
          glutenFreeGrains: false,
          certifiedProtocol: false,
        },
      } as any),
    );

    expect(result.featuredIngredients).toEqual(["Tomate"]);
    expect(result.allergens).toEqual(["milk"]);
    expect(result.presentationForm).toMatchObject({ yieldEnabled: true, minPeople: "4" });
    expect(result.celiacForm).toMatchObject({ enabled: true, crossContaminationControl: true });
    expect(result).not.toHaveProperty("presentation");
    expect(result).not.toHaveProperty("celiacInfo");
  });
});
