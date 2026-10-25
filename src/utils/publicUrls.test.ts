import {
  getPublicBusinessUrl,
  getPublicProductPath,
  getProductPublicUrlIfActive,
  getPublicProductUrl,
} from "./publicUrls";

describe("getPublicProductPath", () => {
  it("builds the canonical path from business, category and product slugs", () => {
    expect(
      getPublicProductPath({
        businessId: "dulce-momento",
        categorySlug: "postres",
        productSlug: "torta-de-limon",
        productId: 42,
      }),
    ).toBe("/dulce-momento/postres/torta-de-limon");
  });

  it("builds the uncategorized path from the mapper's sin-categoria slug", () => {
    expect(
      getPublicProductPath({
        businessId: "dulce-momento",
        categorySlug: "sin-categoria",
        productSlug: "galleta",
        productId: 1,
      }),
    ).toBe("/dulce-momento/sin-categoria/galleta");
  });

  it("falls back to the legacy path when the category slug is missing", () => {
    expect(
      getPublicProductPath({
        businessId: "dulce-momento",
        categorySlug: null,
        productSlug: "galleta",
        productId: 1,
      }),
    ).toBe("/dulce-momento/product/1");
  });

  it("encodes every segment", () => {
    expect(
      getPublicProductPath({
        businessId: "a b",
        categorySlug: "c/d",
        productSlug: "e?f",
        productId: 1,
      }),
    ).toBe("/a%20b/c%2Fd/e%3Ff");
  });

  it("falls back to the legacy path when the product has no slug", () => {
    expect(
      getPublicProductPath({
        businessId: "dulce-momento",
        categorySlug: "postres",
        productSlug: null,
        productId: 42,
      }),
    ).toBe("/dulce-momento/product/42");
    expect(
      getPublicProductPath({ businessId: "dulce-momento", productId: "7" }),
    ).toBe("/dulce-momento/product/7");
  });
});

describe("getPublicProductUrl", () => {
  it("prefixes the canonical path with the current origin", () => {
    expect(
      getPublicProductUrl({
        businessId: "dulce-momento",
        categorySlug: "postres",
        productSlug: "torta",
        productId: 42,
      }),
    ).toBe(`${window.location.origin}/dulce-momento/postres/torta`);
  });

  it("uses the legacy path when there is no product slug", () => {
    expect(
      getPublicProductUrl({ businessId: "dulce-momento", productId: 42 }),
    ).toBe(`${window.location.origin}/dulce-momento/product/42`);
  });
});

describe("getPublicBusinessUrl", () => {
  it("builds the profile link from the current origin", () => {
    expect(getPublicBusinessUrl("dulce-momento")).toBe(
      `${window.location.origin}/dulce-momento`,
    );
  });

  it("encodes characters that are unsafe in a path segment", () => {
    expect(getPublicBusinessUrl("a b/c")).toBe(
      `${window.location.origin}/a%20b%2Fc`,
    );
  });
});

describe("getProductPublicUrlIfActive", () => {
  const product = { id: 3, slug: "pizza", categorySlug: "platos", is_active: true };

  it("returns the public URL for active products", () => {
    expect(getProductPublicUrlIfActive(product, "biz")).toBe(
      `${window.location.origin}/biz/platos/pizza`,
    );
  });

  it("treats a missing is_active as active", () => {
    expect(getProductPublicUrlIfActive({ ...product, is_active: undefined }, "biz")).toBeDefined();
  });

  it("returns undefined without businessId or for inactive products", () => {
    expect(getProductPublicUrlIfActive(product, undefined)).toBeUndefined();
    expect(getProductPublicUrlIfActive({ ...product, is_active: false }, "biz")).toBeUndefined();
  });
});
