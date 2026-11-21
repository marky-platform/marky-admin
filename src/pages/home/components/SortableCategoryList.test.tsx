import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import SortableCategoryList from "./SortableCategoryList";


// Dnd-kit marca la fila/tile ordenable con role=button + aria-roledescription.
const sortableEl = () =>
  screen
    .getAllByRole("button")
    .find((el) => el.getAttribute("aria-roledescription") === "sortable")!;
const categories = [
  { id: 1, label: "Pizzas", order: 0 },
  { id: 2, label: "Sushi", order: 1 },
] as any;

beforeAll(() => {
  // jsdom no implementa scrollIntoView (lo usa dnd-kit al iniciar un arrastre).
  Element.prototype.scrollIntoView = jest.fn();
});

describe("SortableCategoryList (teclado + dnd-kit)", () => {
  it("las teclas de promo/eliminar no inician un arrastre; las de la fila sí", () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <SortableCategoryList
          categories={categories}
          onOrderChange={jest.fn()}
          setActiveScreen={jest.fn()}
          isSortable
          isEditable
        />
      </ThemeProvider>
    );
    const promo = screen.getAllByRole("button", {
      name: "Configurar promoción de la categoría",
    })[0];
    const del = screen.getAllByRole("button", { name: "Eliminar categoría" })[0];
    for (const el of [promo, del]) {
      expect(fireEvent.keyDown(el, { key: "Enter", code: "Enter" })).toBe(true);
      expect(fireEvent.keyDown(el, { key: " ", code: "Space" })).toBe(true);
    }
    const row = sortableEl();
    expect(row).not.toBeNull();
    expect(fireEvent.keyDown(row, { key: "Enter", code: "Enter" })).toBe(false);
  });
});
