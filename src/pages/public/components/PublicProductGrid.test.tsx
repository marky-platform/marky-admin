import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import PublicProductGrid from "./PublicProductGrid";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import { getPublicCatalog } from "../../../services/publicService";

// publicService hits the network via a real axios instance (publicAxios.ts);
// mock it out the same way productService is mocked in productGrid.test.tsx,
// so tests never make a real HTTP call.
// ProductActionsMenu reads the business id (Copiar URL) via
// useBusinessAccountInfo -> businessService -> axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
jest.mock("../../../services/businessService", () => ({
  getBusinessAccountInfo: jest.fn(),
}));

jest.mock("../../../services/publicService", () => ({
  getPublicCatalog: jest.fn(),
}));

// PublicProductGrid renders CategoryGroup -> ProductCard -> ProductActionsMenu,
// which transitively imports productService -> axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
// Mock it out fully, same as productGrid.test.tsx does.
jest.mock("../../../services/productService", () => ({
  getProductCategories: jest.fn(),
  getProductCategoriesWithProducts: jest.fn(),
  createProductCategory: jest.fn(),
  updateProductCategory: jest.fn(),
  updateProductCategoryAvailability: jest.fn(),
  deleteProductCategory: jest.fn(),
  addPromotionToProductCategory: jest.fn(),
  updateProductCategoryOrder: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  getProductById: jest.fn(),
  deleteProduct: jest.fn(),
}));

const mockedGetPublicCatalog = getPublicCatalog as jest.Mock;

const category: CategoryWithProducts = {
  id: 1,
  name: "Postres",
  icon: "cookie",
  multibuy_option: null,
  discount_percentage: "0",
  promotion_starts_at: null,
  promotion_ends_at: null,
  is_available: true,
  products: [
    { id: 42, name: "Galleta de chocolate", description: "Rica y crocante", price: "2.00" },
    { id: 43, name: "Torta de limón", description: "Con merengue", price: "5.00" },
  ],
};

const LocationProbe = () => (
  <div data-testid="location">{useLocation().pathname}</div>
);

const renderPublicProductGrid = (
  categories: { id: number; name: string; icon: string }[] = [],
  categoriesLoading = false,
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <PublicProductGrid
            businessId="dulce-momento"
            categories={categories}
            categoriesLoading={categoriesLoading}
          />
          <LocationProbe />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("PublicProductGrid client-side search", () => {
  beforeEach(() => {
    mockedGetPublicCatalog.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 2,
      results: [category],
    });
  });

  // The search field debounces via useDebounce (500ms, real setTimeout) before
  // propagating up to the filter state. Rather than waiting on that real
  // delay (flaky under a loaded CI worker pool — a genuine wall-clock wait
  // competing with dozens of parallel test processes), fake timers make the
  // debounce advance deterministically and instantly.
  it("filters products by name client-side", async () => {
    renderPublicProductGrid();
    await screen.findByText("Galleta de chocolate");
    expect(screen.getByText("Torta de limón")).toBeInTheDocument();

    jest.useFakeTimers();
    try {
      fireEvent.change(
        screen.getByPlaceholderText("Buscar por texto o SKU del producto"),
        { target: { value: "limón" } },
      );
      act(() => {
        jest.advanceTimersByTime(600);
      });
    } finally {
      jest.useRealTimers();
    }

    expect(screen.queryByText("Galleta de chocolate")).not.toBeInTheDocument();
    expect(screen.getByText("Torta de limón")).toBeInTheDocument();
  });

  it("filters products by description client-side", async () => {
    renderPublicProductGrid();
    await screen.findByText("Galleta de chocolate");

    jest.useFakeTimers();
    try {
      fireEvent.change(
        screen.getByPlaceholderText("Buscar por texto o SKU del producto"),
        { target: { value: "crocante" } },
      );
      act(() => {
        jest.advanceTimersByTime(600);
      });
    } finally {
      jest.useRealTimers();
    }

    expect(screen.queryByText("Torta de limón")).not.toBeInTheDocument();
    expect(screen.getByText("Galleta de chocolate")).toBeInTheDocument();
  });

  it("renders products with no admin actions menu", async () => {
    renderPublicProductGrid();

    await screen.findByText("Galleta de chocolate");

    // No CategoryGroup "..." menu and no per-card ProductActionsMenu trigger
    // (both hidden by `readOnly`). Scoped to the product cards themselves so
    // this doesn't assert on FilterSection's own (legitimate) controls.
    for (const card of screen.getAllByTestId("product-card")) {
      expect(within(card).queryAllByRole("button")).toHaveLength(0);
    }
  });

  it("does not render a category returned without visible products", async () => {
    mockedGetPublicCatalog.mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      products_count: 2,
      results: [
        { ...category, id: 99, name: "Categoría vacía", products: [] },
        category,
      ],
    });

    renderPublicProductGrid();

    await screen.findByText("Galleta de chocolate");
    expect(screen.queryByText("Categoría vacía")).not.toBeInTheDocument();
  });
});

// JSDOM has no matchMedia: simulate a viewport below md (down("md") is a
// max-width query) or at md+ (up("md") is a min-width query).
const mockViewport = (belowMd: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: belowMd
      ? query.includes("max-width")
      : query.includes("min-width"),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe("PublicProductGrid breakpoint scope", () => {
  beforeEach(() => {
    mockedGetPublicCatalog.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 2,
      results: [category],
    });
  });

  afterEach(() => {
    delete (window as any).matchMedia;
  });

  it("reserves the mobile chip row while the public categories are loading", async () => {
    mockViewport(true);
    renderPublicProductGrid([], true);
    await screen.findByText("Galleta de chocolate");

    expect(screen.getByTestId("catalog-controls-row-2-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("catalog-controls-row-2")).not.toBeInTheDocument();
  });

  it("renders the two-row mobile controls below md and not FilterSection", async () => {
    mockViewport(true);
    renderPublicProductGrid([
      { id: 1, name: "Postres", icon: "cookie" },
      { id: 2, name: "Bebidas", icon: "cup" },
    ]);
    await screen.findByText("Galleta de chocolate");

    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("catalog-controls-row-2")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Todos" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Buscar por/),
    ).not.toBeInTheDocument();
  });

  it("keeps FilterSection at md+ and not the mobile controls", async () => {
    mockViewport(false);
    renderPublicProductGrid();
    await screen.findByText("Galleta de chocolate");

    expect(
      screen.queryByTestId("catalog-controls-row-1"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar por nombre del producto"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
  });
});

describe("PublicProductGrid navigation", () => {
  const withSlugs: CategoryWithProducts = {
    ...category,
    slug: "postres",
    products: [
      {
        id: 42,
        name: "Galleta de chocolate",
        description: "Rica y crocante",
        price: "2.00",
        slug: "galleta-de-chocolate",
        categorySlug: "postres",
      },
      // No slug yet (created during the deploy window): legacy fallback.
      { id: 43, name: "Torta de limón", description: "Con merengue", price: "5.00" },
    ],
  };

  beforeEach(() => {
    mockedGetPublicCatalog.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 2,
      results: [withSlugs],
    });
  });

  it("opens the canonical URL when the product has a slug", async () => {
    renderPublicProductGrid();
    fireEvent.click(await screen.findByText("Galleta de chocolate"));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/dulce-momento/postres/galleta-de-chocolate",
    );
  });

  it("falls back to the legacy URL when the product has no slug", async () => {
    renderPublicProductGrid();
    fireEvent.click(await screen.findByText("Torta de limón"));
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/dulce-momento/product/43",
    );
  });
});

describe("PublicProductGrid empty and error states keep the controls", () => {
  const emptyCatalog = {
    count: 0,
    next: null,
    previous: null,
    products_count: 0,
    results: [],
  };

  afterEach(() => {
    delete (window as any).matchMedia;
  });

  it("keeps the mobile controls when the catalog is empty", async () => {
    mockViewport(true);
    mockedGetPublicCatalog.mockResolvedValue(emptyCatalog);
    renderPublicProductGrid();

    expect(
      await screen.findByText("Este negocio aún no tiene productos."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Promociones/ }),
    ).toBeInTheDocument();
  });

  it("keeps the desktop filters when the catalog is empty", async () => {
    mockViewport(false);
    mockedGetPublicCatalog.mockResolvedValue(emptyCatalog);
    renderPublicProductGrid();

    await screen.findByText("Este negocio aún no tiene productos.");
    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
  });

  it("lets the user clear an active filter whose results are empty (desktop)", async () => {
    mockViewport(false);
    mockedGetPublicCatalog.mockImplementation(async (_id: string, params: any) =>
      params?.has_promotion
        ? emptyCatalog
        : {
            count: 1,
            next: null,
            previous: null,
            products_count: 2,
            results: [category],
          },
    );
    renderPublicProductGrid();
    await screen.findByText("Galleta de chocolate");

    fireEvent.click(screen.getByRole("button", { name: /^Promociones/ }));
    expect(
      await screen.findByText("No encontramos productos con estos filtros."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Este negocio aún no tiene productos."),
    ).not.toBeInTheDocument();

    // Segundo clic en la misma píldora: quita el filtro.
    fireEvent.click(screen.getByRole("button", { name: /^Promociones/ }));
    expect(await screen.findByText("Galleta de chocolate")).toBeInTheDocument();
  });

  it("lets the user clear an active filter whose results are empty (mobile)", async () => {
    mockViewport(true);
    mockedGetPublicCatalog.mockImplementation(async (_id: string, params: any) =>
      params?.has_promotion
        ? emptyCatalog
        : {
            count: 1,
            next: null,
            previous: null,
            products_count: 2,
            results: [category],
          },
    );
    renderPublicProductGrid();
    await screen.findByText("Galleta de chocolate");

    fireEvent.click(screen.getByRole("button", { name: /^Promociones/ }));
    await screen.findByText("No encontramos productos con estos filtros.");
    fireEvent.click(screen.getByRole("button", { name: /^Promociones/ }));
    expect(await screen.findByText("Galleta de chocolate")).toBeInTheDocument();
  });

  it("keeps the controls when loading products fails", async () => {
    mockViewport(true);
    mockedGetPublicCatalog.mockRejectedValue(new Error("boom"));
    renderPublicProductGrid();

    expect(
      await screen.findByText("Error al cargar los productos."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Promociones/ }),
    ).toBeInTheDocument();
  });
});

// Contadores de Promociones / Destacados: dependen solo de las categorías
// seleccionadas, no de las propias píldoras ni de lo renderizado.
describe("PublicProductGrid filter counters (mobile)", () => {
  const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
      resolve = res;
    });
    return { promise, resolve };
  };

  const response = (counts: { promotion: number; featured: number }) => ({
    count: 1,
    next: null,
    previous: null,
    products_count: 2,
    filter_counts: counts,
    results: [category],
  });

  const allCounts = { promotion: 3, featured: 2 };
  const postresCounts = { promotion: 1, featured: 0 };
  const categories = [
    { id: 1, name: "Postres", icon: "cookie" },
    { id: 2, name: "Bebidas", icon: "cup" },
  ];

  const pillNames = () =>
    within(screen.getByTestId("catalog-controls-row-1"))
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((name) => /^(Promociones|Destacados)/.test(name));

  beforeEach(() => {
    mockViewport(true);
    mockedGetPublicCatalog.mockReset();
  });

  afterEach(() => {
    delete (window as any).matchMedia;
  });

  it("keeps both counters visible and unchanged while a pill is toggled", async () => {
    mockedGetPublicCatalog.mockResolvedValueOnce(response(allCounts));
    renderPublicProductGrid(categories);
    await screen.findByRole("button", { name: "Promociones 3" });
    expect(screen.getByRole("button", { name: "Destacados 2" })).toBeVisible();

    const pending = deferred<ReturnType<typeof response>>();
    mockedGetPublicCatalog.mockReturnValueOnce(pending.promise);
    fireEvent.click(screen.getByRole("button", { name: "Promociones 3" }));

    // Request in flight: nothing is cleared or recalculated.
    expect(pillNames()).toEqual(["Promociones 3", "Destacados 2"]);
    expect(mockedGetPublicCatalog).toHaveBeenLastCalledWith(
      "dulce-momento",
      expect.objectContaining({ has_promotion: true }),
    );

    await act(async () => {
      pending.resolve(response(allCounts));
    });
    expect(pillNames()).toEqual(["Promociones 3", "Destacados 2"]);

    // Switching to the other pill and back to none keeps them as well.
    const pending2 = deferred<ReturnType<typeof response>>();
    mockedGetPublicCatalog.mockReturnValueOnce(pending2.promise);
    fireEvent.click(screen.getByRole("button", { name: "Destacados 2" }));
    expect(pillNames()).toEqual(["Promociones 3", "Destacados 2"]);
    await act(async () => {
      pending2.resolve(response(allCounts));
    });
    expect(pillNames()).toEqual(["Promociones 3", "Destacados 2"]);
  });

  it("recalculates both counters from the selected categories, keeping the old pair while loading", async () => {
    mockedGetPublicCatalog.mockResolvedValueOnce(response(allCounts));
    renderPublicProductGrid(categories);
    await screen.findByRole("button", { name: "Promociones 3" });

    const pending = deferred<ReturnType<typeof response>>();
    mockedGetPublicCatalog.mockReturnValueOnce(pending.promise);
    fireEvent.click(
      within(screen.getByTestId("catalog-controls-row-2")).getByRole("button", {
        name: "Postres",
      }),
    );

    expect(mockedGetPublicCatalog).toHaveBeenLastCalledWith(
      "dulce-momento",
      expect.objectContaining({ ids: "1" }),
    );
    // Still the previous pair while the new one is loading.
    expect(pillNames()).toEqual(["Promociones 3", "Destacados 2"]);

    await act(async () => {
      pending.resolve(response(postresCounts));
    });
    // Both change together, and 0 is shown.
    await screen.findByRole("button", { name: "Promociones 1" });
    expect(pillNames()).toEqual(["Promociones 1", "Destacados 0"]);
    expect(
      within(screen.getByRole("button", { name: "Destacados 0" })).getByTestId(
        "filter-count",
      ),
    ).toHaveTextContent("0");

    // Back to "Todo" recalculates again.
    mockedGetPublicCatalog.mockResolvedValueOnce(response(allCounts));
    fireEvent.click(
      within(screen.getByTestId("catalog-controls-row-2")).getByRole("button", {
        name: "Todo",
      }),
    );
    await screen.findByRole("button", { name: "Promociones 3" });
    expect(screen.getByRole("button", { name: "Destacados 2" })).toBeVisible();
  });
});
