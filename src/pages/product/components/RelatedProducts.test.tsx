import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import RelatedProducts from "./RelatedProducts";
import { Product, ProductGridItem } from "../../../types/product";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";
import { getPublicCatalog } from "../../../services/publicService";
import { getProductCategoriesWithProducts } from "../../../services/productService";

// ProductActionsMenu reads the business id (Copiar URL) via
// useBusinessAccountInfo -> businessService -> axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
jest.mock("../../../services/businessService", () => ({
  getBusinessAccountInfo: jest.fn(),
}));

jest.mock("../../../services/publicService", () => ({
  getPublicCatalog: jest.fn(),
}));

// productService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform.
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

const mockedPublicCatalog = getPublicCatalog as jest.Mock;
const mockedAdminCatalog = getProductCategoriesWithProducts as jest.Mock;

const gridItem = (id: number, name: string): ProductGridItem => ({
  id,
  name,
  description: `Descripción ${name}`,
  price: "10.00",
});

const catalogOf = (products: ProductGridItem[]) => ({
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 7,
      name: "Bebidas",
      icon: "cookie",
      multibuy_option: null,
      discount_percentage: "0",
      promotion_starts_at: null,
      promotion_ends_at: null,
      is_available: true,
      products,
    } as CategoryWithProducts,
    // The API can also append the synthetic "Sin categoría" bucket.
    {
      id: 0,
      name: "Sin categoría",
      icon: "",
      multibuy_option: null,
      discount_percentage: "0",
      promotion_starts_at: null,
      promotion_ends_at: null,
      is_available: true,
      products: [gridItem(99, "Huérfano")],
    } as CategoryWithProducts,
  ],
});

const product: Product = {
  id: 1,
  name: "Frappuccino",
  description: "desc",
  price: 10,
  category: { id: 7, name: "Bebidas" },
  is_active: true,
  variants: [],
  addons: [],
  stopper: "",
};

const LocationProbe = () => (
  <div data-testid="location">{useLocation().pathname}</div>
);

const renderRelated = (
  props: Partial<React.ComponentProps<typeof RelatedProducts>> = {},
) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <RelatedProducts product={product} {...props} />
          <LocationProbe />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe("RelatedProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the category's other products on the public page and excludes the current one", async () => {
    mockedPublicCatalog.mockResolvedValue(
      catalogOf([
        gridItem(1, "Frappuccino"),
        gridItem(2, "Latte"),
        gridItem(3, "Mocha"),
      ]),
    );

    renderRelated({ businessId: "dulce-momento" });

    expect(
      await screen.findByRole("heading", { name: "Productos en Bebidas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Latte")).toBeInTheDocument();
    expect(screen.getByText("Mocha")).toBeInTheDocument();
    expect(screen.queryByText("Frappuccino")).not.toBeInTheDocument();
    expect(screen.queryByText("Huérfano")).not.toBeInTheDocument();
    expect(mockedPublicCatalog).toHaveBeenCalledWith("dulce-momento", {
      ids: "7",
    });
    expect(mockedAdminCatalog).not.toHaveBeenCalled();
  });

  it("navigates to the public product route from a public card", async () => {
    mockedPublicCatalog.mockResolvedValue(catalogOf([gridItem(2, "Latte")]));

    renderRelated({ businessId: "dulce-momento" });
    fireEvent.click(await screen.findByText("Latte"));

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/dulce-momento/product/2",
      ),
    );
  });

  it("lets keyboard users reach each card and open it with Enter", async () => {
    mockedPublicCatalog.mockResolvedValue(
      catalogOf([gridItem(2, "Latte"), gridItem(3, "Mocha")]),
    );

    renderRelated({ businessId: "dulce-momento" });

    const links = await screen.findAllByRole("link");
    expect(links.map((l) => l.getAttribute("aria-label"))).toEqual([
      "Latte",
      "Mocha",
    ]);
    links[1].focus();
    expect(links[1]).toHaveFocus();
    fireEvent.keyDown(links[1], { key: "Enter" });

    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/dulce-momento/product/3",
      ),
    );
  });

  it("uses the admin catalog and route when there is no businessId, without card actions", async () => {
    mockedAdminCatalog.mockResolvedValue(catalogOf([gridItem(2, "Latte")]));

    renderRelated();

    fireEvent.click(await screen.findByText("Latte"));
    await waitFor(() =>
      expect(screen.getByTestId("location")).toHaveTextContent("/product/2"),
    );
    expect(mockedAdminCatalog).toHaveBeenCalledWith({ ids: "7" });
    expect(mockedPublicCatalog).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("caps the grid at five products, keeping the server order", async () => {
    mockedPublicCatalog.mockResolvedValue(
      catalogOf(
        [2, 3, 4, 5, 6, 7, 8].map((id) => gridItem(id, `Producto ${id}`)),
      ),
    );

    renderRelated({ businessId: "dulce-momento" });

    await screen.findByText("Producto 2");
    expect(screen.getAllByTestId("product-card")).toHaveLength(5);
    expect(screen.getByText("Producto 6")).toBeInTheDocument();
    expect(screen.queryByText("Producto 7")).not.toBeInTheDocument();
  });

  it("renders nothing when the product is the only one in its category", async () => {
    mockedPublicCatalog.mockResolvedValue(
      catalogOf([gridItem(1, "Frappuccino")]),
    );

    renderRelated({ businessId: "dulce-momento" });

    await waitFor(() => expect(mockedPublicCatalog).toHaveBeenCalled());
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not fetch or render anything for an uncategorized product", () => {
    renderRelated({
      businessId: "dulce-momento",
      product: { ...product, category: null },
    });

    expect(mockedPublicCatalog).not.toHaveBeenCalled();
    expect(mockedAdminCatalog).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders nothing when the request fails", async () => {
    mockedPublicCatalog.mockRejectedValue(new Error("boom"));

    renderRelated({ businessId: "dulce-momento" });

    await waitFor(() => expect(mockedPublicCatalog).toHaveBeenCalled());
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
