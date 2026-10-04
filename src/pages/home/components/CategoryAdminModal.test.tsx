import { fireEvent, render, screen } from "@testing-library/react";
import { CategoryAdminModal } from "./CategoryAdminModal";

// La referencia de `data` debe ser estable: el modal la usa como dependencia
// de un effect que hace setState (un objeto nuevo por render => loop infinito).
const mockCategoriesQuery = {
  isLoading: false,
  data: {
    results: [{ id: 1, name: "Bebidas", icon: "a", discount_percentage: "0" }],
  },
};
jest.mock("../../../hooks/useProductCategories", () => ({
  __esModule: true,
  default: () => mockCategoriesQuery,
}));
const mockOrderMutation = { mutate: jest.fn() };
jest.mock("../../../hooks/useUpdateProductCategoryOrder", () => ({
  __esModule: true,
  default: () => mockOrderMutation,
}));
jest.mock("./categoryAdminModalScreens/Main", () => ({
  Main: () => <div>pantalla-main</div>,
}));
jest.mock("./categoryAdminModalScreens/Welcome", () => ({
  Welcome: () => <div />,
}));
jest.mock("./categoryAdminModalScreens/Promotion", () => ({
  Promotion: () => <div />,
}));
jest.mock("./SortableCategoryList", () => ({
  __esModule: true,
  default: () => <div />,
}));
// CreateEdit real hace la mutación; el stub simula "creación exitosa".
jest.mock("./categoryAdminModalScreens/CreateEdit", () => ({
  CreateEdit: ({ onSubmit, hideCreateAnother }: any) => (
    <div>
      <span>pantalla-create</span>
      {!hideCreateAnother && <span>crear-otra</span>}
      <button
        onClick={() => onSubmit({ id: 9, label: "Nueva", icon: "x" }, false)}
      >
        simular-creada
      </button>
    </div>
  ),
}));

describe("CategoryAdminModal reuse", () => {
  it("opens on the create screen, notifies the created category and closes", () => {
    const onClose = jest.fn();
    const onCategoryCreated = jest.fn();
    render(
      <CategoryAdminModal
        open
        initialScreen="createEdit"
        onClose={onClose}
        onCategoryCreated={onCategoryCreated}
      />,
    );
    expect(screen.getByText("pantalla-create")).toBeInTheDocument();
    expect(screen.queryByText("crear-otra")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("simular-creada"));
    expect(onCategoryCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 9 }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not notify anything when the modal is just closed (cancel)", () => {
    const onClose = jest.fn();
    const onCategoryCreated = jest.fn();
    render(
      <CategoryAdminModal
        open
        initialScreen="createEdit"
        onClose={onClose}
        onCategoryCreated={onCategoryCreated}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onCategoryCreated).not.toHaveBeenCalled();
  });

  it("keeps the Home behaviour: creating goes back to the list and nothing is auto-closed", () => {
    const onClose = jest.fn();
    render(<CategoryAdminModal open onClose={onClose} />);
    expect(screen.getByText("pantalla-main")).toBeInTheDocument();
  });
});
