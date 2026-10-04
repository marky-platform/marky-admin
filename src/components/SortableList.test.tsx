import { render, screen, fireEvent } from "@testing-library/react";
import SortableList from "./SortableList";

const items = [
  { id: 1, name: "Uno" },
  { id: 2, name: "Dos" },
];

const renderList = (
  props: Partial<
    React.ComponentProps<typeof SortableList<(typeof items)[0]>>
  > = {},
) =>
  render(
    <SortableList
      items={items}
      renderItem={(item) => <span>{item.name}</span>}
      onSave={jest.fn()}
      {...props}
    />,
  );

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
});
