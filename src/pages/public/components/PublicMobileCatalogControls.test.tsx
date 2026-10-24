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

// `categoryOptions` sin definir simula al admin, que no inyecta categorías.
const Harness: React.FC<{
  categoryOptions?: typeof categories;
  initialSelected?: typeof categories;
  loading?: boolean;
}> = ({ categoryOptions, initialSelected = [], loading = false }) => {
  const [values, setValues] = useState({
    categories: initialSelected as any[],
    offer: false,
    featured: false,
  });
  latest = values;
  return (
    <PublicMobileCatalogControls
      values={values}
      onFilterChange={(next) => setValues((prev) => ({ ...prev, ...next }))}
      categories={categoryOptions}
      categoriesLoading={loading}
      viewMode="grid"
      onViewModeChange={jest.fn()}
      filterCounts={{ promotion: 3, featured: 2 }}
    />
  );
};

// `null` = sin lista inyectada (admin). Un `undefined` activaría el valor por defecto.
const renderControls = (
  categoryOptions: typeof categories | null = categories,
  extra: { initialSelected?: typeof categories; loading?: boolean } = {},
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={lightTheme}>
        <Harness categoryOptions={categoryOptions ?? undefined} {...extra} />
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

  it("hides the category-chip row when the public catalog has only one category", () => {
    renderControls([categories[0]]);

    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("catalog-controls-row-2"),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Postres" })).not.toBeInTheDocument();
  });

  it("hides the category-chip row when the public catalog has no categories", () => {
    renderControls([]);

    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("catalog-controls-row-2"),
    ).not.toBeInTheDocument();
  });

  it("keeps the chip row when no category list is injected (admin home)", () => {
    renderControls(null);

    expect(screen.getByTestId("catalog-controls-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("catalog-controls-row-2")).toBeInTheDocument();
  });

  it("keeps the chip row while a category is selected so Todo can clear it", () => {
    renderControls([categories[0]], { initialSelected: [categories[0]] });

    expect(screen.getByTestId("catalog-controls-row-2")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Todo" }));
    expect(latest.categories).toEqual([]);
  });

  it("hides the row again once the selection is cleared and fewer than two remain", () => {
    renderControls([categories[0]], { initialSelected: [categories[0]] });

    fireEvent.click(screen.getByRole("button", { name: "Todo" }));

    expect(
      screen.queryByTestId("catalog-controls-row-2"),
    ).not.toBeInTheDocument();
  });

  it("reserves the row with a placeholder while the public categories load", () => {
    renderControls([], { loading: true });

    expect(screen.getByTestId("catalog-controls-row-2-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("catalog-controls-row-2")).not.toBeInTheDocument();
  });

  it("drops the placeholder once the list has loaded", () => {
    renderControls([categories[0]], { loading: false });

    expect(
      screen.queryByTestId("catalog-controls-row-2-loading"),
    ).not.toBeInTheDocument();
  });

  it("never shows the placeholder for the admin (no injected list)", () => {
    renderControls(null, { loading: true });

    expect(screen.getByTestId("catalog-controls-row-2")).toBeInTheDocument();
    expect(
      screen.queryByTestId("catalog-controls-row-2-loading"),
    ).not.toBeInTheDocument();
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
