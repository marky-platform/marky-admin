import { getPublicProductUrl } from "./publicUrls";

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
