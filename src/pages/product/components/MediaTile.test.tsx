import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import MediaTile from "./MediaTile";

jest.mock("../../../hooks/useMediaObjectUrl", () => ({
  useMediaObjectUrl: () => "blob:test",
}));
jest.mock("./VideoThumbnail", () => ({ VideoThumbnail: () => null }));


// Dnd-kit marca la fila/tile ordenable con role=button + aria-roledescription.
const sortableEl = () =>
  screen
    .getAllByRole("button")
    .find((el) => el.getAttribute("aria-roledescription") === "sortable")!;
const renderTile = (onCrop = jest.fn(), onDelete = jest.fn()) => {
  render(
    <ThemeProvider theme={lightTheme}>
      <DndContext>
        <SortableContext items={["t1"]}>
          <MediaTile
            id="t1"
            kind="image"
            filled
            sortable
            file="x.png"
            onCrop={onCrop}
            onDelete={onDelete}
          />
        </SortableContext>
      </DndContext>
    </ThemeProvider>
  );
  return { onCrop, onDelete };
};

beforeAll(() => {
  // jsdom no implementa scrollIntoView (lo usa dnd-kit al iniciar un arrastre).
  Element.prototype.scrollIntoView = jest.fn();
});

describe("MediaTile (teclado + dnd-kit)", () => {
  it("Enter en Recortar/Eliminar activa su onClick y no inicia un arrastre", () => {
    const { onCrop, onDelete } = renderTile();
    for (const name of ["Recortar imagen", "Eliminar archivo"]) {
      const btn = screen.getByRole("button", { name });
      btn.focus();
      // fireEvent devuelve false si alguien hizo preventDefault (inicio de drag).
      expect(fireEvent.keyDown(btn, { key: "Enter", code: "Enter" })).toBe(true);
      expect(fireEvent.keyDown(btn, { key: " ", code: "Space" })).toBe(true);
    }
    userEvent.click(screen.getByRole("button", { name: "Eliminar archivo" }));
    userEvent.click(screen.getByRole("button", { name: "Recortar imagen" }));
    expect(onDelete).toHaveBeenCalled();
    expect(onCrop).toHaveBeenCalled();
  });

  it.each([
    ["Enter", "Enter"],
    [" ", "Space"],
  ])("la tecla %p sobre el propio tile sigue pudiendo iniciar el arrastre", (key, code) => {
    renderTile();
    const tile = sortableEl();
    expect(tile).not.toBeNull();
    expect(fireEvent.keyDown(tile, { key, code })).toBe(false);
  });
});
