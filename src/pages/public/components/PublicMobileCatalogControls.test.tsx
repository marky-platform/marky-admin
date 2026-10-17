import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import lightTheme from "../../../themes/light";
import PublicMobileCatalogControls from "./PublicMobileCatalogControls";

jest.mock("../../../services/productService", () => ({
  getProductCategories: jest.fn(),
}));
jest.mock("../../../utils/utils", () => ({ ShowNotification: jest.fn() }));

const categories = [
  { id: 1, name: "Postres" },
  { id: 2, name: "Bebidas" },
];

let latest: { categories: any[]; offer: boolean; featured: boolean };

const Harness: React.FC = () => {
  const [values, setValues] = useState({
    categories: [] as any[],
    offer: false,
    featured: false,
  });
  latest = values;
  return (
    <PublicMobileCatalogControls
      values={values}
      onFilterChange={(next) => setValues((prev) => ({ ...prev, ...next }))}
      categories={categories}
      viewMode="grid"
      onViewModeChange={jest.fn()}
      filterCounts={{ promotion: 3, featured: 2 }}
    />
  );
};

const renderControls = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={lightTheme}>
        <Harness />
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe("PublicMobileCatalogControls", () => {
  it("row 1 holds the pills and view switch, without Todo or the profile menu", () => {
    renderControls();
    const row1 = screen.getByTestId("catalog-controls-row-1");

    expect(
      within(row1).getByRole("button", { name: "Promociones 3" }),
    ).toBeInTheDocument();
    expect(
      within(row1).getByRole("button", { name: "Destacados 2" }),
    ).toBeInTheDocument();
    expect(within(row1).getByRole("group", { name: "Cambiar visualización" }))
      .toBeInTheDocument();
    // El menú de acciones del perfil vive junto al switch de tema.
    expect(
      screen.queryByRole("button", { name: "Más acciones" }),
    ).not.toBeInTheDocument();
    expect(
      within(row1).queryByRole("button", { name: /^Todos?$/ }),
    ).not.toBeInTheDocument();
  });

  it("row 2 starts with Todo followed by the categories, after row 1", () => {
    renderControls();
    const row1 = screen.getByTestId("catalog-controls-row-1");
    const row2 = screen.getByTestId("catalog-controls-row-2");

    expect(
      row1.compareDocumentPosition(row2) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(row2).getAllByRole("button").map((b) => b.textContent),
    ).toEqual(["Todo", "Postres", "Bebidas"]);
  });

  it("deselects Promociones on a second tap and keeps them exclusive", () => {
    renderControls();
    fireEvent.click(screen.getByRole("button", { name: "Promociones 3" }));
    expect(latest.offer).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Destacados 2" }));
    expect(latest).toMatchObject({ offer: false, featured: true });

    fireEvent.click(screen.getByRole("button", { name: "Destacados 2" }));
    expect(latest).toMatchObject({ offer: false, featured: false });
  });

  it("Todo clears only the category and preserves the promo filter", () => {
    renderControls();
    fireEvent.click(screen.getByRole("button", { name: "Promociones 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Postres" }));
    expect(latest.categories).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));

    expect(latest.categories).toHaveLength(0);
    expect(latest.offer).toBe(true);
  });

  it("changing category preserves the promo filter", () => {
    renderControls();
    fireEvent.click(screen.getByRole("button", { name: "Destacados 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Bebidas" }));

    expect(latest.featured).toBe(true);
    expect(latest.categories.map((c) => c.id)).toEqual([2]);
  });
});
