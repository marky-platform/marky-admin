import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetailPage from "./ProductDetailPage";

jest.mock("../../components/Header", () => ({
  Header: () => <header data-testid="shared-header" />,
}));
jest.mock("./components/ProductDetailContent", () => ({
  __esModule: true,
  default: () => <div data-testid="detail-content" />,
  PRODUCT_INFO_MAX_WIDTH: 500,
  PRODUCT_PAGE_MAX_WIDTH: 1000,
}));
jest.mock("../../hooks/useProductDetail", () => ({
  __esModule: true,
  default: () => ({ data: { id: 1 }, isLoading: false, error: null }),
}));
jest.mock("../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({ data: { business_name: "Biz" } }),
}));

describe("ProductDetailPage", () => {
  it("renders the shared top navigation (same Header as Home)", () => {
    window.scrollTo = jest.fn();
    render(
      <MemoryRouter initialEntries={["/products/1"]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("shared-header")).toBeInTheDocument();
    expect(screen.getByTestId("detail-content")).toBeInTheDocument();
  });
});
