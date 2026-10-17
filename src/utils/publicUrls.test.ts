import { getPublicBusinessUrl, getPublicProductUrl } from "./publicUrls";

describe("getPublicProductUrl", () => {
  it("builds the public product link from the current origin", () => {
    expect(getPublicProductUrl("dulce-momento", 42)).toBe(
      `${window.location.origin}/dulce-momento/product/42`,
    );
  });

  it("accepts string ids", () => {
    expect(getPublicProductUrl("dulce-momento", "7")).toBe(
      `${window.location.origin}/dulce-momento/product/7`,
    );
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
