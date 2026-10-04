import { ProductGridItem } from "../types/product";
import { buildProductOrderPayload, splitByPlacement } from "./productOrder";

const product = (
  id: number,
  extra: Partial<ProductGridItem> = {},
): ProductGridItem => ({ id, name: `P${id}`, price: "1.00", ...extra });

describe("splitByPlacement", () => {
  it("pins favorite first, then recommended, and keeps the rest in order", () => {
    const products = [
      product(1),
      product(2, { isRecommended: true }),
      product(3),
      product(4, { isFavorite: true }),
    ];

    const { pinned, sortable } = splitByPlacement(products);

    expect(pinned.map((p) => p.id)).toEqual([4, 2]);
    expect(sortable.map((p) => p.id)).toEqual([1, 3]);
  });

  it("returns empty groups for an empty list", () => {
    expect(splitByPlacement([])).toEqual({ pinned: [], sortable: [] });
  });

  it("leaves everything sortable when nothing is pinned", () => {
    const { pinned, sortable } = splitByPlacement([product(1), product(2)]);
    expect(pinned).toEqual([]);
    expect(sortable.map((p) => p.id)).toEqual([1, 2]);
  });
});

describe("buildProductOrderPayload", () => {
  it("sends pinned ids first, then the sortable order, as numbers", () => {
    const pinned = [product(4), product(2)];
    const sortable = [product(3), product(1)];

    expect(buildProductOrderPayload(pinned, sortable)).toEqual([4, 2, 3, 1]);
  });

  it("coerces string ids to numbers", () => {
    expect(buildProductOrderPayload([], [product("7" as any)])).toEqual([7]);
  });
});
