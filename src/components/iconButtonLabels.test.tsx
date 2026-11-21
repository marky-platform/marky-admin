import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "./Modal";
import MediaTile from "../pages/product/components/MediaTile";
import { SortableContext } from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";

// Etiquetas accesibles de botones de solo ícono (F-32).
describe("icon buttons con nombre accesible", () => {
  it("Modal: botones Volver y Cerrar", () => {
    const onBack = jest.fn();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} onBack={onBack} showCloseButton title="T">
        contenido
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onBack).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("MediaTile: botones Recortar imagen y Eliminar archivo", () => {
    const onCrop = jest.fn();
    const onDelete = jest.fn();
    render(
      <DndContext>
        <SortableContext items={["m1"]}>
          <MediaTile
            id="m1"
            kind="image"
            filled
            file="http://x/y.jpg"
            onCrop={onCrop}
            onDelete={onDelete}
          />
        </SortableContext>
      </DndContext>
    );
    fireEvent.click(screen.getByRole("button", { name: "Recortar imagen" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar archivo" }));
    expect(onCrop).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });

  it("MediaTile vacío es un botón accionable con teclado", () => {
    const onAdd = jest.fn();
    render(<MediaTile id="a" kind="image" filled={false} onAdd={onAdd} />);
    const tile = screen.getByRole("button");
    fireEvent.keyDown(tile, { key: "Enter" });
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
