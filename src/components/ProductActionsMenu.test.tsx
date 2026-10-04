import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../themes/light";
import ProductActionsMenu from "./ProductActionsMenu";
import { getBusinessAccountInfo } from "../services/businessService";
import { ShowNotification } from "../utils/utils";

// productService / businessService transitively import axiosConfig -> axios,
// whose installed version ships ESM-only and breaks CRA's default Jest
// transform. Mock them out fully.
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
jest.mock("../services/businessService", () => ({
  getBusinessAccountInfo: jest.fn(),
}));
jest.mock("../utils/utils", () => ({
  ShowNotification: jest.fn(),
}));

const mockedAccountInfo = getBusinessAccountInfo as jest.Mock;
const mockedNotify = ShowNotification as jest.Mock;
const writeText = jest.fn();

const renderMenu = (productId: number | string = 42) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <ProductActionsMenu product={{ id: productId }} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );

const openMenuAndClickCopy = async () => {
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(await screen.findByRole("menuitem", { name: "Copiar URL" }));
};

describe("ProductActionsMenu: Copiar URL", () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText } });
    writeText.mockResolvedValue(undefined);
  });

  it("copies the public product link and confirms with a toast", async () => {
    mockedAccountInfo.mockResolvedValue({ business_id: "dulce-momento" });
    renderMenu(42);
    // Let the account-info query resolve before the user clicks.
    await waitFor(() => expect(mockedAccountInfo).toHaveBeenCalled());
    await screen.findByRole("button");
    await new Promise((resolve) => setTimeout(resolve, 0));

    await openMenuAndClickCopy();

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/dulce-momento/product/42`,
      ),
    );
    expect(mockedNotify).toHaveBeenCalledWith({
      message: "Enlace copiado",
      type: "success",
    });
  });

  it("shows an error and copies nothing when the business id is unavailable", async () => {
    mockedAccountInfo.mockResolvedValue(undefined);
    renderMenu(42);

    await openMenuAndClickCopy();

    await waitFor(() =>
      expect(mockedNotify).toHaveBeenCalledWith({
        message: "No se pudo copiar el enlace",
        type: "error",
      }),
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("shows an error when the clipboard write is rejected", async () => {
    mockedAccountInfo.mockResolvedValue({ business_id: "dulce-momento" });
    writeText.mockRejectedValue(new Error("denied"));
    renderMenu(42);
    await waitFor(() => expect(mockedAccountInfo).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));

    await openMenuAndClickCopy();

    await waitFor(() =>
      expect(mockedNotify).toHaveBeenCalledWith({
        message: "No se pudo copiar el enlace",
        type: "error",
      }),
    );
  });
});
