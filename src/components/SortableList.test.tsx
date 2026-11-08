import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import SortableList from "./SortableList";
import lightTheme from "../themes/light";

const items = [
  { id: 1, name: "Uno" },
  { id: 2, name: "Dos" },
];


// Dnd-kit marca la fila/tile ordenable con role=button + aria-roledescription.
const sortableEl = () =>
  screen
    .getAllByRole("button")
    .find((el) => el.getAttribute("aria-roledescription") === "sortable")!;
const renderList = (
  props: Partial<
    React.ComponentProps<typeof SortableList<(typeof items)[0]>>
  > = {},
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <SortableList
        items={items}
        renderItem={(item) => <span>{item.name}</span>}
        onSave={jest.fn()}
        {...props}
      />
    </ThemeProvider>,
  );

beforeAll(() => {
  // jsdom no implementa scrollIntoView (lo usa dnd-kit al iniciar un arrastre).
  Element.prototype.scrollIntoView = jest.fn();
});

describe("SortableList", () => {
  it("renders the rows and starts with Guardar disabled", () => {
    renderList();

    expect(screen.getByText("Uno")).toBeInTheDocument();
    expect(screen.getByText("Dos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("keeps Guardar disabled for a single item", () => {
    renderList({ items: [items[0]] });

    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("shows the empty message and a disabled Guardar for an empty list", () => {
    renderList({ items: [], emptyMessage: "Nada que ordenar" });

    expect(screen.getByText("Nada que ordenar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled();
  });

  it("hides the empty message when there is pinned content", () => {
    renderList({
      items: [],
      emptyMessage: "Nada que ordenar",
      pinnedContent: <div>Fijado</div>,
    });

    expect(screen.getByText("Fijado")).toBeInTheDocument();
    expect(screen.queryByText("Nada que ordenar")).not.toBeInTheDocument();
  });

  it("does not call onSave while nothing has moved", () => {
    const onSave = jest.fn();
    renderList({ onSave });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("las teclas de un control anidado no inician un arrastre; las de la fila sí", () => {
    renderList({
      renderItem: (item) => (
        <span>
          {item.name}
          <IconButton aria-label={`Quitar ${item.name}`} />
        </span>
      ),
    });
    const inner = screen.getByRole("button", { name: "Quitar Uno" });
    expect(fireEvent.keyDown(inner, { key: "Enter", code: "Enter" })).toBe(true);
    const row = sortableEl();
    expect(row).not.toBeNull();
    expect(fireEvent.keyDown(row, { key: "Enter", code: "Enter" })).toBe(false);
  });
});
