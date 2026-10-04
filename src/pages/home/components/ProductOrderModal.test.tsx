import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../../../themes/light";
import ProductOrderModal from "./ProductOrderModal";
import {
  getProductCategoriesWithProducts,
  updateProductCategoryProductsOrder,
} from "../../../services/productService";
import { ShowNotification } from "../../../utils/utils";
import { ProductGridItem } from "../../../types/product";

// productService transitively imports axiosConfig -> axios (ESM-only, breaks
// CRA's Jest transform); mock it out like the other component tests do.
jest.mock("../../../services/productService", () => ({
  getProductCategoriesWithProducts: jest.fn(),
  updateProductCategoryProductsOrder: jest.fn(),
}));

jest.mock("../../../utils/utils", () => ({
  ...jest.requireActual("../../../utils/utils"),
  ShowNotification: jest.fn(),
}));

// dnd-kit pointer/keyboard coordinates aren't reliable in jsdom, so the list
// is stubbed: it renders pinned content then the rows, and a button that
// "saves" the rows in reverse order (i.e. as if the admin had dragged).
jest.mock("../../../components/SortableList", () => ({
  __esModule: true,
  default: ({ items, renderItem, pinnedContent, onSave, isSaving }: any) => (
    <div>
      {pinnedContent}
      {items.map((item: any) => (
        <div key={item.id}>{renderItem(item)}</div>
      ))}
      <button disabled={isSaving} onClick={() => onSave([...items].reverse())}>
        Guardar
      </button>
    </div>
  ),
}));

const mockedGet = getProductCategoriesWithProducts as jest.Mock;
const mockedSave = updateProductCategoryProductsOrder as jest.Mock;

const product = (
  id: number,
  extra: Partial<ProductGridItem> = {},
): ProductGridItem => ({ id, name: `Producto ${id}`, price: "1.00", ...extra });

const category = { id: 5, name: "Platos" };

const respondWith = (products: ProductGridItem[]) =>
  mockedGet.mockResolvedValue({
    results: [
      // The backend can also append the synthetic uncategorized bucket.
      { ...category, products },
      { id: null, name: "Sin categoría", products: [product(99)] },
    ],
  });

const renderModal = (onClose: () => void = jest.fn()) => {
  render(
    <QueryClientProvider
      // The app's global QueryClient disables retries; mirror that.
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ThemeProvider theme={lightTheme}>
        <ProductOrderModal open category={category} onClose={onClose} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProductOrderModal", () => {
  it("requests only the selected category's products", async () => {
    respondWith([product(1)]);
    renderModal();

    await screen.findByText("Producto 1");

    expect(mockedGet).toHaveBeenCalledWith({ ids: "5" });
    expect(screen.queryByText("Producto 99")).not.toBeInTheDocument();
  });

  it("shows pinned stopper products before the sortable ones", async () => {
    respondWith([
      product(1),
      product(2, { isRecommended: true }),
      product(3, { isFavorite: true }),
    ]);
    renderModal();

    const favorite = await screen.findByText("Producto 3");
    const recommended = screen.getByText("Producto 2");
    const regular = screen.getByText("Producto 1");

    expect(screen.getByText("Favorito del mes")).toBeInTheDocument();
    expect(screen.getByText("Recomendado")).toBeInTheDocument();
    const before = (a: HTMLElement, b: HTMLElement) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(before(favorite, recommended)).toBe(true);
    expect(before(recommended, regular)).toBe(true);
  });

  it("shows the empty state for a category without products", async () => {
    respondWith([]);
    renderModal();

    expect(
      await screen.findByText("Esta categoría no tiene productos."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar" })).toBeNull();
  });

  it("shows an inline message when the fetch fails", async () => {
    mockedGet.mockRejectedValue(new Error("boom"));
    renderModal();

    expect(
      await screen.findByText(/No se pudieron cargar los productos/),
    ).toBeInTheDocument();
  });

  it("renders a single product", async () => {
    respondWith([product(1)]);
    renderModal();

    expect(await screen.findByText("Producto 1")).toBeInTheDocument();
  });

  it("saves pinned ids first, then the new order, and closes on success", async () => {
    respondWith([product(1), product(2), product(3, { isFavorite: true })]);
    mockedSave.mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderModal(onClose);

    fireEvent.click(await screen.findByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(mockedSave).toHaveBeenCalledWith(5, [3, 2, 1]);
    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Orden de productos actualizado",
        type: "success",
      }),
    );
  });

  it("keeps the modal open and shows an error toast when the save fails", async () => {
    respondWith([product(1), product(2)]);
    mockedSave.mockRejectedValue({ message: "La lista de productos cambió." });
    const onClose = jest.fn();
    renderModal(onClose);

    fireEvent.click(await screen.findByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(ShowNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "La lista de productos cambió.",
          type: "error",
        }),
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Organizar productos")).toBeInTheDocument();
  });
});
