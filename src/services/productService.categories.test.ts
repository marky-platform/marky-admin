import api from "./axiosConfig";
import { getProductCategories } from "./productService";

jest.mock("./axiosConfig", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedGet = api.get as jest.Mock;

describe("getProductCategories", () => {
  beforeEach(() => mockedGet.mockReset());

  it("devuelve el sobre results completo sin pedir paginación", async () => {
    const payload = {
      count: 75,
      next: null,
      previous: null,
      results: Array.from({ length: 75 }, (_, i) => ({ id: i + 1 })),
    };
    mockedGet.mockResolvedValue({ data: payload });

    const data = await getProductCategories();

    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringMatching(/\/products\/product-categories\/$/),
      { params: undefined },
    );
    expect(data.results).toHaveLength(75);
    expect(data.next).toBeNull();
  });
});
