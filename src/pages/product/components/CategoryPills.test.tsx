import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen } from "@testing-library/react";
import lightTheme from "../../../themes/light";
import CategoryPills from "./CategoryPills";

jest.mock("../../../hooks/useProductCategories", () => ({
  __esModule: true,
  default: () => ({
    data: {
      results: [
        { id: 1, name: "Bebidas", icon: "a" },
        { id: 2, name: "Postres", icon: "b" },
      ],
    },
  }),
}));

const renderPills = (selected: any, handlers = {}) => {
  const props = {
    onSelect: jest.fn(),
    onCreateCategory: jest.fn(),
    ...handlers,
  };
  render(
    <ThemeProvider theme={lightTheme}>
      <CategoryPills selectedCategory={selected} {...props} />
    </ThemeProvider>,
  );
  return props;
};

describe("CategoryPills", () => {
  it("marks only the selected category as pressed", () => {
    renderPills({ id: 2, name: "Postres" });
    expect(screen.getByRole("button", { name: "Postres" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Bebidas" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("selects on click and deselects the active pill (category is optional)", () => {
    const { onSelect } = renderPills({ id: 2, name: "Postres" });
    fireEvent.click(screen.getByRole("button", { name: "Bebidas" }));
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 1, name: "Bebidas" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Postres" }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("shows the helper text and Enter/Space-accessible pills", () => {
    renderPills(null);
    expect(
      screen.getByText("Selecciona dónde quieres organizar este producto."),
    ).toBeInTheDocument();
    // las pills son botones nativos (teclado) y se ven outlined
    const pill = screen.getByRole("button", { name: "Bebidas" });
    expect(pill.tagName).toBe("DIV");
    expect(pill).toHaveClass("MuiChip-outlined");
    expect(pill).toHaveAttribute("tabindex", "0");
  });

  it("offers inline category creation", () => {
    const { onCreateCategory } = renderPills(null);
    fireEvent.click(screen.getByText("Crear nueva categoría"));
    expect(onCreateCategory).toHaveBeenCalledTimes(1);
  });
});
