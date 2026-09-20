import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../themes/light";
import ProductCard from "./ProductCard";
import { ProductGridItem } from "../types/product";

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
    // "ends" phase badge must use the urgency (error) color, not the
    // scheduled (warning) one — this is the one fully-specified visual
    // behavior in the whole countdown feature, so it needs a real assertion
    // rather than relying on the text-content checks above to catch a
    // "badge painted the wrong color" regression.
    expect(getComputedStyle(badge).backgroundColor).toBe("rgb(246, 72, 72)"); // error.main #F64848
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
    // "starts" phase badge must use the warning color, distinct from the
    // "ends" phase's error color above.
    expect(getComputedStyle(badge).backgroundColor).toBe("rgb(237, 108, 2)"); // warning.main #ed6c02 (MUI default)
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
});
