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

    const name = screen.getByText("Galleta de chocolate");
    const price = screen.getByText("$1.60");
    expect(getComputedStyle(name).fontSize).toBe("12px");
    expect(getComputedStyle(price).fontSize).toBe("14px");
    expect(getComputedStyle(price).fontWeight).toBe("600");
  });
});

describe("ProductCard title typography", () => {
  it("renders the product name at the compact card size", () => {
    renderProductCard();

    const name = screen.getByText("Galleta de chocolate");
    expect(name).toBeInTheDocument();
    expect(getComputedStyle(name).fontSize).toBe("12px");
    expect(getComputedStyle(name).lineHeight).toBe("14px");
  });
});

describe("ProductCard description", () => {
  const longDescription =
    "Una descripcion bastante larga que deberia truncarse visualmente en la tarjeta de producto sin desbordar el layout.";

  it("renders the truncated description text at the compact card size", () => {
    renderProductCard({
      product: { ...product, description: longDescription },
    });

    const description = screen.getByText(truncateText(longDescription, 60));
    expect(description).toBeInTheDocument();
    expect(getComputedStyle(description).fontSize).toBe("12px");
    expect(getComputedStyle(description).lineHeight).toBe("14px");
  });

  it("does not show a hover tooltip with the full description", () => {
    renderProductCard({
      product: { ...product, description: longDescription },
    });

    const description = screen.getByText(truncateText(longDescription, 60));
    fireEvent.mouseOver(description);

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});

describe("ProductCard price typography", () => {
  it("uses the compact bold size for the primary price and the compact size for the secondary price", () => {
    const discountedProduct: ProductGridItem = {
      ...product,
      discountPercent: 20,
      primaryPrice: "$2.00",
      primaryPriceWithDiscount: "$1.60",
      secondaryPriceWithDiscount: "US$1.60",
    };
    renderProductCard({ product: discountedProduct });

    const primary = screen.getByText("$1.60");
    const secondary = screen.getByText("US$1.60");

    expect(getComputedStyle(primary).fontSize).toBe("14px");
    expect(getComputedStyle(primary).fontWeight).toBe("600");
    expect(getComputedStyle(primary).lineHeight).toBe("14px");

    expect(getComputedStyle(secondary).fontSize).toBe("12px");
  });

  it("uses the compact bold size for the plain fallback price", () => {
    renderProductCard();

    const price = screen.getByText("2,00");
    expect(getComputedStyle(price).fontSize).toBe("14px");
    expect(getComputedStyle(price).fontWeight).toBe("600");
  });
});

describe("ProductCard promotion/discount/multibuy badges over the image", () => {
  it("shows the discount badge with the compact pill geometry", () => {
    renderProductCard({ product: { ...product, discountPercent: 15 } });

    expect(screen.getByText("-15%")).toBeInTheDocument();
    const pill = screen.getByTestId("product-badge");
    expect(getComputedStyle(pill).borderRadius).toBe("24px");
    expect(getComputedStyle(pill).padding).toBe("4px 8px 4px 8px");
  });

  it("shows the multibuy badge with the compact pill geometry", () => {
    renderProductCard({ product: { ...product, multibuyOption: "2x1" } });

    expect(screen.getByText("2x1")).toBeInTheDocument();
    const pill = screen.getByTestId("product-badge");
    expect(getComputedStyle(pill).borderRadius).toBe("24px");
    expect(getComputedStyle(pill).padding).toBe("4px 8px 4px 8px");
  });
});

describe("ProductCard destacado (Favorito / Recomendado)", () => {
  it("renders the 'Recomendado' stopper with the shared ribbon geometry", () => {
    renderProductCard({ product: { ...product, isRecommended: true } });

    const stopper = screen.getByText("Recomendado");
    expect(stopper).toBeInTheDocument();
    expect(getComputedStyle(stopper).fontSize).toBe("12px");
    expect(getComputedStyle(stopper).borderTopLeftRadius).toBe("15px");
    expect(getComputedStyle(stopper).borderBottomLeftRadius).toBe("15px");
    // Single mechanism for the pointed right edge: the clip-path, not a
    // borderRight/borderTopRightRadius that would double the tip width.
    expect(getComputedStyle(stopper).clipPath).toBe(
      "polygon(0px 0px, 100% 0px, calc(100% - 11px) 100%, 0% 100%)",
    );
  });

  it("renders the 'Favorito del mes' stopper with the same geometry as 'Recomendado'", () => {
    renderProductCard({ product: { ...product, isFavorite: true } });

    const stopper = screen.getByText("Favorito del mes");
    expect(stopper).toBeInTheDocument();
    expect(getComputedStyle(stopper).fontSize).toBe("12px");
    expect(getComputedStyle(stopper).borderTopLeftRadius).toBe("15px");
    expect(getComputedStyle(stopper).borderBottomLeftRadius).toBe("15px");
    expect(getComputedStyle(stopper).clipPath).toBe(
      "polygon(0px 0px, 100% 0px, calc(100% - 11px) 100%, 0% 100%)",
    );
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
  it("shows a centered 'No disponible' overlay when the product is not available", () => {
    renderProductCard({ product: { ...product, is_available: false } });

    const label = screen.getByText("No disponible");
    expect(label).toBeInTheDocument();
  });

  it("falls back to is_active when is_available is not provided", () => {
    renderProductCard({ product: { ...product, is_active: false } });

    expect(screen.getByText("No disponible")).toBeInTheDocument();
  });

  it("does not show the overlay when the product is available", () => {
    renderProductCard({ product: { ...product, is_available: true } });

    expect(screen.queryByText("No disponible")).not.toBeInTheDocument();
  });
});
