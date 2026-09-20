import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import ProductDetailInfo from "./ProductDetailInfo";
import { Product } from "../../../types/product";

// productService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform. Mock it out,
// same as ProductCard.test.tsx does.
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

const product: Product = {
  id: 42,
  name: "Galleta de chocolate",
  description: "Una galleta rica",
  price: 2,
  category: { id: 1, name: "Postres" },
  is_active: true,
  variants: [],
  addons: [],
  stopper: "",
};

const renderProductDetailInfo = (
  props: Partial<React.ComponentProps<typeof ProductDetailInfo>> = {},
) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <ProductDetailInfo product={product} {...props} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("ProductDetailInfo readOnly rendering (public page)", () => {
  it("renders the actions menu by default (admin)", () => {
    renderProductDetailInfo();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("renders no actions menu when readOnly", () => {
    renderProductDetailInfo({ readOnly: true });
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("still renders the product name and category when readOnly", () => {
    renderProductDetailInfo({ readOnly: true });
    expect(screen.getByText("Galleta de chocolate")).toBeInTheDocument();
    expect(screen.getByText("Postres")).toBeInTheDocument();
  });
});
