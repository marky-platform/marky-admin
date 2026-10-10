import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import { ProductGrid } from "./productGrid";
import { CategoryWithProducts } from "../../../types/categoryWithProducts";

import {
  getProductCategoriesWithProducts,
  deleteProduct,
} from "../../../services/productService";
import { getHomePageData } from "../../../services/businessService";

// productService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform. Mock it out
// fully (no jest.requireActual) so the real axios-backed module never loads,
// same reasoning as Login.test.tsx mocking authService.
jest.mock("../../../services/productService", () => ({
  getProductCategories: jest.fn(),
  getProductCategoriesWithProducts: jest.fn(),
  createProductCategory: jest.fn(),
  updateProductCategory: jest.fn(),
  updateProductCategoryAvailability: jest.fn(),
  deleteProductCategory: jest.fn(),
  addPromotionToProductCategory: jest.fn(),
  updateProductCategoryOrder: jest.fn(),
  updateProductCategoryProductsOrder: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  getProductById: jest.fn(),
  deleteProduct: jest.fn(),
}));

// productGrid also reads the business name (for the empty-state welcome
// copy) via useHomePageData -> businessService, which transitively imports
// axiosConfig -> axios; same ESM-parsing issue as productService above.
jest.mock("../../../services/businessService", () => ({
  getHomePageData: jest.fn(),
}));

// The real modal pulls in the category hooks/forms; these tests only care
// that Home opens it directly on the create screen.
jest.mock("./CategoryAdminModal", () => ({
  __esModule: true,
  default: ({ open, initialScreen, onCategoryCreated, onClose }: any) =>
    open ? (
      <div>
        <div>category-modal-{initialScreen ?? "main"}</div>
        <button
          onClick={() => {
            // El modal real entrega `label` en runtime (ver ProductFormPage).
            onCategoryCreated?.({ id: 9, label: "Postres QA", icon: "x" });
            onClose?.(false);
          }}
        >
          simular-categoria-creada
        </button>
      </div>
    ) : null,
}));

const mockedGetCategories = getProductCategoriesWithProducts as jest.Mock;
const mockedDeleteProduct = deleteProduct as jest.Mock;
const mockedGetHomePageData = getHomePageData as jest.Mock;

const category: CategoryWithProducts = {
  id: 1,
  name: "Galletas",
  icon: "cookie",
  multibuy_option: null,
  discount_percentage: "0",
  promotion_starts_at: null,
  promotion_ends_at: null,
  is_available: true,
  products: [
    {
      id: 42,
      name: "Galleta de chocolate",
      price: "2.00",
    },
  ],
};

const renderProductGrid = (initialEntries: string[] = ["/"]) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={initialEntries}>
          <ProductGrid />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

// Renders a button alongside ProductGrid, inside the SAME MemoryRouter
// entry/history stack, so clicking it drives an in-place `navigate()` call
// (search-string-only change on the current entry) rather than mounting a
// fresh MemoryRouter at a different initialEntries value. This mirrors the
// real bug scenario: the notification bell and ProductGrid are both
// rendered by the same /home page, so clicking a notification while already
// on /home does NOT remount ProductGrid — it only changes location.search.
const NavigateButton = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}>trigger-in-place-deep-link</button>
  );
};

const renderProductGridWithInPlaceNav = (
  initialEntries: string[] = ["/home"],
) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={initialEntries}>
          <NavigateButton to="/home?promoCategory=1" />
          <ProductGrid />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

describe("ProductGrid product delete flow (Home page)", () => {
  beforeEach(() => {
    mockedGetCategories.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 1,
      results: [category],
    });
    mockedDeleteProduct.mockResolvedValue(undefined);
    mockedGetHomePageData.mockResolvedValue({ business_name: "Test Biz" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows a confirmation dialog and calls deleteProduct with the right id after confirming 'Eliminar'", async () => {
    renderProductGrid();

    await screen.findByText("Galleta de chocolate");
    const card = await screen.findByTestId("product-card");
    const menuButton = within(card).getByRole("button");
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Eliminar"));

    expect(
      await screen.findByText("¿Estás seguro de eliminar este producto?"),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Confirmo que deseo eliminar el producto/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(mockedDeleteProduct).toHaveBeenCalledWith(42);
    });
  });

  it("does not call deleteProduct if the confirmation dialog is cancelled", async () => {
    renderProductGrid();

    await screen.findByText("Galleta de chocolate");
    const card = await screen.findByTestId("product-card");
    const menuButton = within(card).getByRole("button");
    fireEvent.click(menuButton);
    fireEvent.click(screen.getByText("Eliminar"));

    await screen.findByText("¿Estás seguro de eliminar este producto?");
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mockedDeleteProduct).not.toHaveBeenCalled();
  });
});

describe("ProductGrid category-expiry notification deep link", () => {
  beforeEach(() => {
    mockedGetCategories.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 1,
      results: [category],
    });
    mockedGetHomePageData.mockResolvedValue({ business_name: "Test Biz" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("opens the category promotion modal for the category id in ?promoCategory=", async () => {
    renderProductGrid(["/home?promoCategory=1"]);

    expect(await screen.findByText("Promoción")).toBeInTheDocument();
  });

  it("does not open the modal when ?promoCategory= doesn't match any category", async () => {
    renderProductGrid(["/home?promoCategory=999"]);

    await screen.findByText("Galleta de chocolate");
    expect(screen.queryByText("Promoción")).not.toBeInTheDocument();
  });

  it("opens the modal when ?promoCategory= arrives via an in-place navigation while already on /home (no remount)", async () => {
    // Regression test: the notification bell and ProductGrid are rendered
    // by the same /home page, so clicking a category-expiry notification
    // while already viewing the grid navigates /home -> /home?promoCategory=1
    // WITHOUT remounting ProductGrid — only location.search changes. Confirm
    // the deep-link effect still picks this up (previously it only ran on
    // categoriesWithProductsRaw changing, which doesn't happen here since
    // the query data was already loaded and doesn't refetch).
    renderProductGridWithInPlaceNav(["/home"]);

    await screen.findByText("Galleta de chocolate");
    expect(screen.queryByText("Promoción")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("trigger-in-place-deep-link"));

    expect(await screen.findByText("Promoción")).toBeInTheDocument();
  });
});

describe("ProductGrid no-products empty state", () => {
  beforeEach(() => {
    mockedGetHomePageData.mockResolvedValue({ business_name: "Test Biz" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows the onboarding empty state for categories with zero products, without the action bar", async () => {
    mockedGetCategories.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 0,
      results: [{ ...category, products: [] }],
    });
    renderProductGrid();

    expect(
      await screen.findByRole("button", { name: "Agregar mi primer producto" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crear una categoría" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Administrar Categorías")).not.toBeInTheDocument();
    expect(screen.queryByText("Agregar Producto")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Buscar por nombre del producto"),
    ).not.toBeInTheDocument();
  });

  it("opens the category modal directly on the create screen from 'Crear una categoría'", async () => {
    mockedGetCategories.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      products_count: 0,
      results: [],
    });
    renderProductGrid();

    fireEvent.click(
      await screen.findByRole("button", { name: "Crear una categoría" }),
    );
    expect(screen.getByText("category-modal-createEdit")).toBeInTheDocument();
  });

  it("confirms the created category in the empty state, since it has no products yet", async () => {
    mockedGetCategories.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      products_count: 0,
      results: [],
    });
    renderProductGrid();

    fireEvent.click(
      await screen.findByRole("button", { name: "Crear una categoría" }),
    );
    fireEvent.click(screen.getByText("simular-categoria-creada"));

    expect(
      await screen.findByText(/Categoría «Postres QA» creada/),
    ).toBeInTheDocument();
  });

  it("keeps the normal catalog once at least one product exists", async () => {
    mockedGetCategories.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      products_count: 1,
      results: [category],
    });
    renderProductGrid();

    expect(await screen.findByText("Galleta de chocolate")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Agregar mi primer producto" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Administrar Categorías")).toBeInTheDocument();
  });
});
