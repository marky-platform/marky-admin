import { render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import ProductDetailContent from "./ProductDetailContent";
import { Product } from "../../../types/product";

// The related-products grid fetches the catalog; these tests are about the
// product body, so keep it empty (RelatedProducts has its own tests).
// ProductActionsMenu reads the business id (Copiar URL) via
// useBusinessAccountInfo -> businessService -> axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
jest.mock("../../../services/businessService", () => ({
  getBusinessAccountInfo: jest.fn(),
}));

jest.mock("../../../services/publicService", () => ({
  getPublicCatalog: jest.fn().mockResolvedValue({ results: [] }),
}));

// productService transitively imports axiosConfig -> axios, whose installed
// version ships ESM-only and breaks CRA's default Jest transform.
jest.mock("../../../services/productService", () => ({
  getProductCategories: jest.fn(),
  getProductCategoriesWithProducts: jest
    .fn()
    .mockResolvedValue({ results: [] }),
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

const legacyProduct: Product = {
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

const fullProduct: Product = {
  ...legacyProduct,
  featuredIngredients: ["Café", "Leche", "Caramelo"],
  allergens: ["tree_nuts", "milk"],
  presentation: {
    version: 1,
    amount: { type: "weight", value: 1.5, unit: "kg" },
    dimensions: {
      shape: "round",
      diameterCm: 22,
      lengthCm: null,
      widthCm: null,
      heightCm: null,
    },
    approximateYield: { minPeople: 12, maxPeople: 15 },
  },
  celiacInfo: {
    version: 1,
    crossContaminationControl: true,
    glutenFreeGrains: true,
    certifiedProtocol: false,
  },
};

const renderContent = (
  product: Product,
  props: Partial<React.ComponentProps<typeof ProductDetailContent>> = {},
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <ProductDetailContent product={product} {...props} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe("ProductDetailContent: new product information", () => {
  it("shows every new section when the product has all the data", () => {
    renderContent(fullProduct, { readOnly: true });

    expect(screen.getByText("Peso:")).toBeInTheDocument();
    expect(screen.getByText("1,5 kg")).toBeInTheDocument();
    expect(screen.getByText("Tamaño:")).toBeInTheDocument();
    expect(screen.getByText("22 cm de diámetro")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento:")).toBeInTheDocument();
    expect(screen.getByText("12–15 personas")).toBeInTheDocument();

    expect(screen.getByText("Ingredientes principales:")).toBeInTheDocument();
    const ingredients = within(
      screen.getByRole("list", { name: "Ingredientes principales" }),
    );
    expect(
      ingredients.getAllByRole("listitem").map((li) => li.textContent),
    ).toEqual(["Café", "Leche", "Caramelo"]);

    expect(
      screen.getByRole("heading", { name: "Información alimentaria" }),
    ).toBeInTheDocument();
    const allergens = within(
      screen.getByRole("list", { name: "Alérgenos presentes" }),
    );
    expect(
      allergens.getAllByRole("listitem").map((li) => li.textContent),
    ).toEqual(["Frutos secos", "Leche"]);
    expect(
      screen.getByText("Apto para celíacos (SIN TACC)"),
    ).toBeInTheDocument();
    const declarations = within(
      screen.getByRole("list", { name: "Declaraciones SIN TACC" }),
    );
    expect(
      declarations.getAllByRole("listitem").map((li) => li.textContent),
    ).toEqual([
      "Sin trigo, avena, cebada ni centeno",
      "Control de contaminación cruzada",
    ]);
    expect(
      screen.getByText("Información declarada por el negocio."),
    ).toBeInTheDocument();
  });

  it("hides only the sections that have no data (partial product)", () => {
    renderContent(
      {
        ...legacyProduct,
        allergens: ["egg"],
        presentation: {
          version: 1,
          amount: null,
          dimensions: null,
          approximateYield: { minPeople: 1, maxPeople: null },
        },
      },
      { readOnly: true },
    );

    expect(screen.getByText("1 persona")).toBeInTheDocument();
    expect(screen.queryByText("Peso:")).not.toBeInTheDocument();
    expect(screen.queryByText("Volumen:")).not.toBeInTheDocument();
    expect(screen.queryByText("Tamaño:")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ingredientes principales:"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Huevo")).toBeInTheDocument();
    expect(
      screen.queryByText("Apto para celíacos (SIN TACC)"),
    ).not.toBeInTheDocument();
  });

  it("renders repeated ingredients from old data without duplicate-key warnings", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderContent(
      { ...legacyProduct, featuredIngredients: ["Café", "Leche", "Café"] },
      { readOnly: true },
    );

    expect(
      within(
        screen.getByRole("list", { name: "Ingredientes principales" }),
      ).getAllByRole("listitem"),
    ).toHaveLength(3);
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes("same key"),
    );
    expect(keyWarnings).toHaveLength(0);
    consoleError.mockRestore();
  });

  it("renders a legacy product without any of the new fields or empty labels", () => {
    renderContent(legacyProduct, { readOnly: true });

    expect(screen.getByText("Galleta de chocolate")).toBeInTheDocument();
    expect(screen.getByText("Una galleta rica")).toBeInTheDocument();
    expect(screen.getByText("en categoría:")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Información alimentaria" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Ingredientes principales:"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Rendimiento|Tamaño|Peso|Volumen|Cantidad/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/null|undefined/)).not.toBeInTheDocument();
  });

  it("shows the SIN TACC card with no pills when the switch is on but nothing is declared", () => {
    renderContent(
      {
        ...legacyProduct,
        celiacInfo: {
          version: 1,
          crossContaminationControl: false,
          glutenFreeGrains: false,
          certifiedProtocol: false,
        },
      },
      { readOnly: true },
    );

    expect(
      screen.getByText("Apto para celíacos (SIN TACC)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Declaraciones SIN TACC" }),
    ).not.toBeInTheDocument();
  });

  it("keeps admin-only controls out of the read-only view", () => {
    const { unmount } = renderContent(fullProduct);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    unmount();

    renderContent(fullProduct, { readOnly: true });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
