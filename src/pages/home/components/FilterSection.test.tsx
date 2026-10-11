import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import FilterSection from "./FilterSection";

// FilterSection's mobile branch renders CategoryFilterChips, which pulls in
// useProductCategories -> productService -> axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
// Mock it out, same as ProductCard.test.tsx does.
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

// JSDOM has no window.matchMedia, so MUI's useMediaQuery falls back to
// `defaultMatches` (false) for every query unless a test opts in via this
// mock — used here to pin FilterSection to its tablet vs. desktop branch,
// per the mobile/desktop corrective plan's breakpoint contract (mobile/
// tablet: xs–sm, desktop: md+).
const mockMatchMedia = (matchingQuerySubstring: string | null) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: matchingQuerySubstring
      ? query.includes(matchingQuerySubstring)
      : false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const restoreMatchMedia = () => {
  delete (window as any).matchMedia;
};

const renderFilterSection = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <FilterSection
          values={{}}
          onFilterChange={jest.fn()}
          setOpenCategoryModal={jest.fn()}
        />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("FilterSection breakpoint scope", () => {
  afterEach(() => {
    restoreMatchMedia();
  });

  it("keeps the previous search copy on tablet (sm–md, not desktop)", () => {
    // isMobile (down sm) and isDesktop (up md) both resolve to `false` in
    // JSDOM by default, landing on the tablet branch — this is also what
    // every other test in the suite exercises unless it opts into desktop.
    renderFilterSection();

    expect(
      screen.getByPlaceholderText("Buscar por texto o SKU del producto"),
    ).toBeInTheDocument();
  });

  it("uses the name-only search copy on desktop (md+)", () => {
    mockMatchMedia("min-width:900"); // theme.breakpoints.up("md")
    renderFilterSection();

    expect(
      screen.getByPlaceholderText("Buscar por nombre del producto"),
    ).toBeInTheDocument();
  });

  it("shows the Todos / Promociones / Destacados pills on desktop", () => {
    mockMatchMedia("min-width:900"); // theme.breakpoints.up("md")
    renderFilterSection();

    expect(screen.getByRole("button", { name: "Todos" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Promociones" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Destacados" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("En promoción")).not.toBeInTheDocument();
  });

  it("keeps Promociones and Destacados mutually exclusive and clears with Todos", () => {
    mockMatchMedia("min-width:900");
    const onFilterChange = jest.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={lightTheme}>
          <FilterSection
            values={{ offer: true, featured: false }}
            onFilterChange={onFilterChange}
            setOpenCategoryModal={jest.fn()}
            filterCounts={{ promotion: 4, featured: 1 }}
          />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    // Counts render in their own bubble but keep the accessible name.
    fireEvent.click(screen.getByRole("button", { name: "Destacados 1" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      offer: false,
      featured: true,
    });

    fireEvent.click(screen.getByRole("button", { name: "Promociones 4" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      offer: false,
      featured: false,
    });

    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(onFilterChange).toHaveBeenCalledWith({
      offer: false,
      featured: false,
    });
  });

  describe("mobile", () => {
    const renderMobile = (
      extra: Partial<React.ComponentProps<typeof FilterSection>> = {},
    ) => {
      mockMatchMedia("max-width");
      return render(
        <QueryClientProvider client={new QueryClient()}>
          <ThemeProvider theme={lightTheme}>
            <FilterSection
              values={{}}
              onFilterChange={jest.fn()}
              setOpenCategoryModal={jest.fn()}
              categories={[{ id: 1, name: "Pizzas" } as any]}
              {...extra}
            />
          </ThemeProvider>
        </QueryClientProvider>,
      );
    };

    it("keeps the pills by default (public catalog)", () => {
      renderMobile();
      expect(
        screen.getByRole("button", { name: "Promociones" }),
      ).toBeInTheDocument();
    });

    it("hides the Todos / Promociones / Destacados block when scoped out (admin Home)", () => {
      renderMobile({ showCatalogFilterPillsOnMobile: false });
      expect(
        screen.queryByRole("button", { name: "Todos" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Promociones" }),
      ).not.toBeInTheDocument();
      // The category chips stay.
      expect(screen.getByRole("button", { name: "Todo" })).toBeInTheDocument();
    });

    it("category chip 'Todo' shows no number", () => {
      renderMobile({ showCatalogFilterPillsOnMobile: false });
      expect(screen.getByText("Todo")).toBeInTheDocument();
      expect(screen.queryByText(/Todo \(/)).not.toBeInTheDocument();
    });
  });

  it("switches view mode from the toggle", () => {
    mockMatchMedia("min-width:900");
    const onViewModeChange = jest.fn();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={lightTheme}>
          <FilterSection
            values={{}}
            onFilterChange={jest.fn()}
            setOpenCategoryModal={jest.fn()}
            viewMode="grid"
            onViewModeChange={onViewModeChange}
          />
        </ThemeProvider>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Vista de mosaico" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Vista de lista" }));
    expect(onViewModeChange).toHaveBeenCalledWith("list");
  });
});
