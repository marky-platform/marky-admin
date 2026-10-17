import publicApi from "./publicAxios";
import { getPublicProductBySlug } from "./publicService";

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
