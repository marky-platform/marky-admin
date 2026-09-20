import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import PublicProductGrid from "./PublicProductGrid";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import { getPublicCatalog } from "../../../services/publicService";

// publicService hits the network via a real axios instance (publicAxios.ts);
// mock it out the same way productService is mocked in productGrid.test.tsx,
// so tests never make a real HTTP call.
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

const renderPublicProductGrid = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <PublicProductGrid businessId="dulce-momento" categories={[]} />
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
});
