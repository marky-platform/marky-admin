import publicApi from "./publicAxios";
import { getPublicCategories, getPublicProductBySlug } from "./publicService";

jest.mock("./publicAxios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedGet = publicApi.get as jest.Mock;

describe("getPublicProductBySlug", () => {
  it("requests the canonical endpoint and maps the product", async () => {
    mockedGet.mockResolvedValue({
      data: {
        id: 5,
        name: "Torta",
        slug: "torta",
        category: { id: 2, name: "Postres", slug: "postres" },
      },
    });

    const product = await getPublicProductBySlug("dulce momento", "postres", "torta");

    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringMatching(
        /\/public\/business\/dulce%20momento\/categories\/postres\/products\/torta\/$/,
      ),
    );
    expect(product.slug).toBe("torta");
    expect(product.categorySlug).toBe("postres");
  });
});

describe("getPublicCategories", () => {
  it("no envía page_size (las categorías no se paginan) y conserva el sobre results", async () => {
    mockedGet.mockResolvedValue({
      data: { count: 2, next: null, previous: null, results: [{ id: 1 }, { id: 2 }] },
    });

    const data = await getPublicCategories("dulce");

    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/public\/business\/dulce\/categories\/$/),
    );
    expect(data.results).toHaveLength(2);
  });
});
