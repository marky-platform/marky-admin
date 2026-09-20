import { render, screen } from "@testing-library/react";
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

  it("right-aligns the 'En promoción' control on desktop only", () => {
    mockMatchMedia("min-width:900"); // theme.breakpoints.up("md")
    renderFilterSection();

    expect(screen.getByText("En promoción")).toBeInTheDocument();
    const promotionGridItem = screen.getByTestId("promotion-filter-container");
    expect(getComputedStyle(promotionGridItem).justifyContent).toBe(
      "flex-end",
    );
  });
});
