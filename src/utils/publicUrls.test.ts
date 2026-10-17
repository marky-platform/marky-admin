import {
  getPublicBusinessUrl,
  getPublicProductPath,
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

  it("uses sin-categoria when the product has no category slug", () => {
    expect(
      getPublicProductPath({
        businessId: "dulce-momento",
        categorySlug: null,
        productSlug: "galleta",
        productId: 1,
      }),
    ).toBe("/dulce-momento/sin-categoria/galleta");
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
