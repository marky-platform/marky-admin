import {
  mapProductGridItem,
  mapProduct,
  mapCategoryWithProducts,
} from "./productMapper";

describe("mapProductGridItem", () => {
  it("maps snake_case backend fields to camelCase", () => {
    const result = mapProductGridItem({
      id: 1,
      name: "Pizza",
      description: "Pizza de muzzarella",
      image: "pizza.jpg",
      price: 50000,
      primary_price: "PYG 50.000",
      secondary_price: "USD 7,00",
      is_recommended: true,
      is_favorite: false,
      promotion_starts_at: "2024-01-01T00:00:00Z",
      promotion_ends_at: "2024-01-31T00:00:00Z",
      discount_percentage: "10",
      multibuy_option: "2x1",
      is_active: true,
    });

    expect(result).toMatchObject({
      id: 1,
      name: "Pizza",
      primaryPrice: "PYG 50.000",
      secondaryPrice: "USD 7,00",
      isRecommended: true,
      isFavorite: false,
      promotionStartsAt: "2024-01-01T00:00:00Z",
      promotionEndsAt: "2024-01-31T00:00:00Z",
      discountPercent: 10,
      multibuyOption: "2x1",
      is_available: true,
      is_active: true,
    });
  });

  it("maps promotion_status to promotionStatus", () => {
    const result = mapProductGridItem({
      id: 1,
      name: "Pizza",
      price: 100,
      promotion_status: "active",
    });
    expect(result.promotionStatus).toBe("active");
  });

  it("falls back to the camelCase promo fields when re-mapping an already-mapped object", () => {
    // Regression: an object that already went through mapProductGridItem
    // (e.g. re-run through the mapper via an optimistic cache merge) must
    // not lose its countdown fields just because it has no snake_case keys.
    const result = mapProductGridItem({
      id: 1,
      name: "Pizza",
      price: 100,
      promotionStartsAt: "2024-01-01T00:00:00Z",
      promotionEndsAt: "2024-01-31T00:00:00Z",
      promotionStatus: "active",
    });

    expect(result.promotionStartsAt).toBe("2024-01-01T00:00:00Z");
    expect(result.promotionEndsAt).toBe("2024-01-31T00:00:00Z");
    expect(result.promotionStatus).toBe("active");
  });

  it("falls back to is_active when is_available is missing", () => {
    const result = mapProductGridItem({
      id: 1,
      name: "Pizza",
      price: 100,
      is_active: false,
    });

    expect(result.is_available).toBe(false);
  });

  it("defaults is_available to true when neither field is present", () => {
    const result = mapProductGridItem({ id: 1, name: "Pizza", price: 100 });
    expect(result.is_available).toBe(true);
  });

  it("defaults price to 0 when missing", () => {
    const result = mapProductGridItem({ id: 1, name: "Pizza" });
    expect(result.price).toBe(0);
  });
});

describe("mapProduct", () => {
  it("maps snake_case fields and variant prices", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "desc",
      price: 100,
      is_active: true,
      discount_percentage: 15,
      multibuy_option: "3x2",
      promotion_starts_at: "2024-01-01T00:00:00Z",
      promotion_ends_at: "2024-01-31T00:00:00Z",
      primary_price: "PYG 100.000",
      secondary_price: "USD 14,00",
      variants: [
        {
          id: 1,
          name: "Chico",
          primary_price: "PYG 50.000",
          secondary_price: "USD 7,00",
        },
      ],
    });

    expect(result.multibuyOption).toBe("3x2");
    expect(result.discountPercentage).toBe(15);
    expect(result.promotionStartDate).toBe("2024-01-01T00:00:00Z");
    expect(result.promotionEndDate).toBe("2024-01-31T00:00:00Z");
    expect(result.primaryPrice).toBe("PYG 100.000");
    expect(result.secondaryPrice).toBe("USD 14,00");
    expect(result.variants[0]).toMatchObject({
      primaryPrice: "PYG 50.000",
      secondaryPrice: "USD 7,00",
    });
  });

  it("maps promotion_status to promotionStatus", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "desc",
      price: 100,
      is_active: true,
      promotion_status: "expired",
    });
    expect(result.promotionStatus).toBe("expired");
  });

  it("maps the descriptive extras from the API payload", () => {
    const presentation = {
      version: 1,
      amount: { type: "volume", value: 500, unit: "ml" },
      dimensions: null,
      approximateYield: { minPeople: 1, maxPeople: null },
    };
    const celiac = {
      version: 1,
      crossContaminationControl: true,
      glutenFreeGrains: false,
      certifiedProtocol: false,
    };
    const result = mapProduct({
      id: 1,
      name: "Frappuccino",
      description: "desc",
      price: 100,
      is_active: true,
      featured_ingredients: "Café,Leche,Caramelo",
      allergens: "milk,mystery,egg",
      presentation,
      celiac_info: celiac,
    });

    expect(result.featuredIngredients).toEqual(["Café", "Leche", "Caramelo"]);
    expect(result.allergens).toEqual(["milk", "egg"]);
    expect(result.presentation).toEqual(presentation);
    expect(result.celiacInfo).toEqual(celiac);
  });

  it("maps a legacy product with no extras to empty values", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "desc",
      price: 100,
      is_active: true,
      featured_ingredients: null,
      allergens: null,
      presentation: null,
      celiac_info: null,
    });

    expect(result.featuredIngredients).toEqual([]);
    expect(result.allergens).toEqual([]);
    expect(result.presentation).toBeNull();
    expect(result.celiacInfo).toBeNull();
  });

  it("defaults variants to an empty array when missing", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "",
      price: 0,
      is_active: true,
    });

    expect(result.variants).toEqual([]);
  });

  it("defaults addons to an empty array when missing", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "",
      price: 0,
      is_active: true,
    });

    expect(result.addons).toEqual([]);
  });

  it("preserves addons when present", () => {
    const result = mapProduct({
      id: 1,
      name: "Pizza",
      description: "",
      price: 0,
      is_active: true,
      addons: [{ id: 1, name: "Queso extra", price: "2.00" }],
    });

    expect(result.addons).toEqual([{ id: 1, name: "Queso extra", price: "2.00" }]);
  });
});

describe("mapCategoryWithProducts", () => {
  it("maps nested products and forwards availability", () => {
    const result = mapCategoryWithProducts({
      id: 1,
      name: "Pizzas",
      is_active: true,
      products: [{ id: 1, name: "Muzzarella", price: 100 }],
    });

    expect(result.is_available).toBe(true);
    expect(result.products[0]).toMatchObject({ id: 1, name: "Muzzarella" });
  });

  it("defaults products to an empty array when missing", () => {
    const result = mapCategoryWithProducts({
      id: 1,
      name: "Pizzas",
      is_active: true,
    });

    expect(result.products).toEqual([]);
  });
});
