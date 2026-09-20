import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../themes/light";
import ProductCard from "./ProductCard";
import { ProductGridItem } from "../types/product";
import { truncateText } from "../utils/format";

// productService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform. Mock it out,
// same as Login.test.tsx does for authService.
jest.mock("../services/productService", () => ({
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

const product: ProductGridItem = {
  id: 42,
  name: "Galleta de chocolate",
  price: "2.00",
};

// JSDOM has no window.matchMedia, so MUI's useMediaQuery falls back to
// `defaultMatches` (false) for every query — i.e. every test below is
// effectively "mobile" unless a test opts into desktop via this mock.
const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches,
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

const renderProductCard = (
  props: Partial<React.ComponentProps<typeof ProductCard>> = {},
) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <ProductCard product={product} {...props} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("ProductCard discounted price rendering", () => {
  it("shows the discounted price with a struck-through original price when discountPercent > 0", () => {
    const discountedProduct: ProductGridItem = {
      ...product,
      discountPercent: 20,
      primaryPrice: "$2.00",
      primaryPriceWithDiscount: "$1.60",
      secondaryPriceWithDiscount: "US$1.60",
    };
    renderProductCard({ product: discountedProduct });

    expect(screen.getByText("$1.60")).toBeInTheDocument();
    expect(screen.getByText("Antes $2.00")).toBeInTheDocument();
    expect(screen.getByText("US$1.60")).toBeInTheDocument();
  });

  it("falls back to the plain price when there is a multibuy offer, even with a discount", () => {
    const multibuyProduct: ProductGridItem = {
      ...product,
      discountPercent: 20,
      multibuyOption: "2x1",
      primaryPrice: "$2.00",
      primaryPriceWithDiscount: "$1.60",
    };
    renderProductCard({ product: multibuyProduct });

    expect(screen.getByText("$2.00")).toBeInTheDocument();
    expect(screen.queryByText("$1.60")).not.toBeInTheDocument();
  });

  it("shows the discounted price when priceWithDiscount fields are present even if discountPercent reads as 0", () => {
    const staleDiscountPercentProduct: ProductGridItem = {
      ...product,
      discountPercent: 0,
      primaryPrice: "$2.00",
      primaryPriceWithDiscount: "$1.60",
    };
    renderProductCard({ product: staleDiscountPercentProduct });

    expect(screen.getByText("$1.60")).toBeInTheDocument();
    expect(screen.getByText("Antes $2.00")).toBeInTheDocument();
  });

  it("shows the plain price when there is no discount signal at all", () => {
    renderProductCard();

    expect(screen.getByText("2,00")).toBeInTheDocument();
  });
});

describe("ProductCard promotion countdown badge", () => {
  it("shows the countdown when promotionStatus is active", () => {
    const activeProduct: ProductGridItem = {
      ...product,
      promotionStatus: "active",
      promotionEndsAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    };
    renderProductCard({ product: activeProduct });

    const badge = screen.getByText(/^\d{2}:\d{2}:\d{2}:\d{2}$/);
    expect(badge).toBeInTheDocument();
    // The badge always uses the same fixed error.light background regardless
    // of phase (see ProductCard.tsx renderPromotionBadge) — this is the one
    // fully-specified visual behavior in the whole countdown feature, so it
    // needs a real assertion rather than relying on the text-content checks
    // above to catch a "badge painted the wrong color" regression.
    expect(getComputedStyle(badge).backgroundColor).toBe("rgb(255, 234, 234)"); // error.light #FFEAEA
  });

  it("shows the 'Inicia en' indicator when promotionStatus is scheduled", () => {
    // A scheduled promotion (now < promotionStartsAt) shows the "Inicia en"
    // indicator rather than the live countdown — it must not look identical
    // to an already-active countdown.
    const scheduledProduct: ProductGridItem = {
      ...product,
      promotionStatus: "scheduled",
      // A few minutes of headroom past the 2-hour mark so real (unmocked)
      // clock drift during test execution can't floor this down to "1 h".
      promotionStartsAt: new Date(
        Date.now() + 2 * 60 * 60 * 1000 + 5 * 60 * 1000,
      ).toISOString(),
      promotionEndsAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    };
    renderProductCard({ product: scheduledProduct });

    const badge = screen.getByText(/Inicia en 2 h/);
    expect(badge).toBeInTheDocument();
    // Same fixed error.light background as the "ends" phase above — phases
    // are distinguished by label text only, not color (see ProductCard.tsx
    // renderPromotionBadge).
    expect(getComputedStyle(badge).backgroundColor).toBe("rgb(255, 234, 234)"); // error.light #FFEAEA
  });

  it("does not show the countdown when promotionStatus is expired, even with dates present", () => {
    const expiredProduct: ProductGridItem = {
      ...product,
      promotionStatus: "expired",
      promotionStartsAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      promotionEndsAt: new Date(Date.now() - 86400000).toISOString(),
    };
    renderProductCard({ product: expiredProduct });

    expect(screen.queryByText(/día|hora|min/)).not.toBeInTheDocument();
  });

  it("does not show the countdown when promotionStatus is inactive", () => {
    const inactiveProduct: ProductGridItem = {
      ...product,
      promotionStatus: "inactive",
    };
    renderProductCard({ product: inactiveProduct });

    expect(screen.queryByText(/día|hora|min/)).not.toBeInTheDocument();
  });

  it("does not show the countdown when promotionStatus is missing", () => {
    renderProductCard();
    expect(screen.queryByText(/día|hora|min/)).not.toBeInTheDocument();
  });
});

describe("ProductCard 'Eliminar' menu action (Home page card)", () => {
  it("calls onDeleteClick with the product when 'Eliminar' is clicked", () => {
    const onDeleteClick = jest.fn();
    renderProductCard({ onDeleteClick });

    const [menuButton] = screen.getAllByRole("button");
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Eliminar"));

    expect(onDeleteClick).toHaveBeenCalledTimes(1);
    expect(onDeleteClick).toHaveBeenCalledWith(product);
  });

  it("does not throw when 'Eliminar' is clicked and no onDeleteClick prop is given", () => {
    renderProductCard();

    const [menuButton] = screen.getAllByRole("button");
    fireEvent.click(menuButton);

    expect(() => fireEvent.click(screen.getByText("Eliminar"))).not.toThrow();
  });
});

describe("ProductCard readOnly rendering (public page)", () => {
  it("renders no actions menu when readOnly", () => {
    renderProductCard({ readOnly: true });

    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("still calls onClick when readOnly", () => {
    const onClick = jest.fn();
    renderProductCard({ readOnly: true, onClick });

    fireEvent.click(screen.getByTestId("product-card"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the same title/price visual design as the admin card, only hiding the menu", () => {
    const discountedProduct: ProductGridItem = {
      ...product,
      discountPercent: 20,
      primaryPrice: "$2.00",
      primaryPriceWithDiscount: "$1.60",
    };
    renderProductCard({ product: discountedProduct, readOnly: true });

    expect(screen.getByText("Galleta de chocolate")).toBeInTheDocument();
    expect(screen.getByText("$1.60")).toBeInTheDocument();
  });
});

// Geometry (font size, padding, radius, position) is expressed as
// responsive `{ xs, md }` sx values per the mobile/desktop corrective plan.
// JSDOM does not evaluate `@media` breakpoints reliably in getComputedStyle,
// so these tests assert semantic content/behavior only — visual geometry at
// each breakpoint is verified in the browser (see corrective plan's
// "Browser verification" section), not here.
describe("ProductCard description", () => {
  const longDescription =
    "Una descripcion bastante larga que deberia truncarse visualmente en la tarjeta de producto sin desbordar el layout.";

  it("renders the truncated description text", () => {
    renderProductCard({
      product: { ...product, description: longDescription },
    });

    expect(
      screen.getByText(truncateText(longDescription, 60)),
    ).toBeInTheDocument();
  });

  it("shows the hover tooltip with the full description on mobile/touch (matchMedia unsupported, desktop query does not match)", async () => {
    renderProductCard({
      product: { ...product, description: longDescription },
    });

    const description = screen.getByText(truncateText(longDescription, 60));
    fireEvent.mouseOver(description);

    // MUI Tooltip's real enterDelay (100ms) can be starved well past the
    // default 1000ms findByRole budget under a loaded, parallel CI worker
    // pool — same flakiness class as ChannelWizardModal.test.tsx's dialog
    // wait, fixed the same way.
    expect(
      await screen.findByRole("tooltip", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("disables the hover tooltip at desktop (theme.breakpoints.up('md') matches)", () => {
    mockMatchMedia(true);
    try {
      renderProductCard({
        product: { ...product, description: longDescription },
      });

      const description = screen.getByText(truncateText(longDescription, 60));
      fireEvent.mouseOver(description);

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    } finally {
      restoreMatchMedia();
    }
  });
});

describe("ProductCard promotion/discount/multibuy badges over the image", () => {
  it("shows the discount badge", () => {
    renderProductCard({ product: { ...product, discountPercent: 15 } });

    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getByTestId("product-badge")).toBeInTheDocument();
  });

  it("shows the multibuy badge", () => {
    renderProductCard({ product: { ...product, multibuyOption: "2x1" } });

    expect(screen.getByText("2x1")).toBeInTheDocument();
    expect(screen.getByTestId("product-badge")).toBeInTheDocument();
  });

  it("renders the badge container anchored to the image's top-left corner", () => {
    renderProductCard({ product: { ...product, discountPercent: 15 } });

    expect(screen.getByTestId("product-badge-container")).toBeInTheDocument();
  });
});

describe("ProductCard destacado (Favorito / Recomendado)", () => {
  it("renders the 'Recomendado' stopper", () => {
    renderProductCard({ product: { ...product, isRecommended: true } });

    expect(screen.getByText("Recomendado")).toBeInTheDocument();
  });

  it("renders the 'Favorito del mes' stopper", () => {
    renderProductCard({ product: { ...product, isFavorite: true } });

    expect(screen.getByText("Favorito del mes")).toBeInTheDocument();
  });

  it("prefers 'Favorito del mes' over 'Recomendado' when both flags are set", () => {
    renderProductCard({
      product: { ...product, isFavorite: true, isRecommended: true },
    });

    expect(screen.getByText("Favorito del mes")).toBeInTheDocument();
    expect(screen.queryByText("Recomendado")).not.toBeInTheDocument();
  });
});

describe("ProductCard 'No disponible' availability overlay", () => {
  // "No disponible" renders as two reciprocal-display presentation wrappers
  // (mobile centered overlay vs. desktop corner badge) — only one is ever
  // in the accessibility tree at a given breakpoint (the other is
  // `display: none`), but JSDOM doesn't evaluate that responsive `@media`
  // rule, so both are present in the test DOM. Assert on count rather than
  // a single `getByText` match.
  it("shows the 'No disponible' label when the product is not available", () => {
    renderProductCard({ product: { ...product, is_available: false } });

    expect(screen.getAllByText("No disponible").length).toBeGreaterThan(0);
  });

  it("falls back to is_active when is_available is not provided", () => {
    renderProductCard({ product: { ...product, is_active: false } });

    expect(screen.getAllByText("No disponible").length).toBeGreaterThan(0);
  });

  it("does not show the label when the product is available", () => {
    renderProductCard({ product: { ...product, is_available: true } });

    expect(screen.queryByText("No disponible")).not.toBeInTheDocument();
  });

  it("co-displays with the discount badge instead of covering it (2a416d9 regression check)", () => {
    renderProductCard({
      product: { ...product, is_available: false, discountPercent: 15 },
    });

    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getAllByText("No disponible").length).toBeGreaterThan(0);
  });
});
