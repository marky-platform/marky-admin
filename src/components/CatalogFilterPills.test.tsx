import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../themes/light";
import CatalogFilterPills from "./CatalogFilterPills";

const renderPills = (props: Partial<React.ComponentProps<typeof CatalogFilterPills>> = {}) => {
  const onChange = jest.fn();
  render(
    <ThemeProvider theme={lightTheme}>
      <CatalogFilterPills
        offer={false}
        featured={false}
        onChange={onChange}
        {...props}
      />
    </ThemeProvider>,
  );
  return { onChange };
};

describe("CatalogFilterPills", () => {
  it("selecting Promociones deselects Destacados", () => {
    const { onChange } = renderPills({ featured: true });
    fireEvent.click(screen.getByRole("button", { name: "Promociones" }));
    expect(onChange).toHaveBeenCalledWith({ offer: true, featured: false });
  });

  it("selecting Destacados deselects Promociones", () => {
    const { onChange } = renderPills({ offer: true });
    fireEvent.click(screen.getByRole("button", { name: "Destacados" }));
    expect(onChange).toHaveBeenCalledWith({ offer: false, featured: true });
  });

  it("pressing the active filter goes back to Todos", () => {
    const { onChange } = renderPills({ offer: true });
    fireEvent.click(screen.getByRole("button", { name: "Promociones" }));
    expect(onChange).toHaveBeenCalledWith({ offer: false, featured: false });
  });

  it("Todos clears both", () => {
    const { onChange } = renderPills({ featured: true });
    fireEvent.click(screen.getByRole("button", { name: "Todos" }));
    expect(onChange).toHaveBeenCalledWith({ offer: false, featured: false });
  });

  it("renders the count (including 0) in its own bubble and keeps the accessible name", () => {
    renderPills({ counts: { promotion: 4, featured: 0 } });
    const promo = screen.getByRole("button", { name: "Promociones 4" });
    expect(within(promo).getByTestId("filter-count")).toHaveTextContent("4");
    // Count 0 is shown too.
    const featured = screen.getByRole("button", { name: "Destacados 0" });
    expect(within(featured).getByTestId("filter-count")).toHaveTextContent("0");
    // Todos never shows a count.
    expect(
      within(screen.getByRole("button", { name: "Todos" })).queryByTestId(
        "filter-count",
      ),
    ).not.toBeInTheDocument();
  });

  it("hides the Todos pill when showAll is false", () => {
    renderPills({ showAll: false });
    expect(
      screen.queryByRole("button", { name: "Todos" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Promociones" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Destacados" }),
    ).toBeInTheDocument();
  });
});
