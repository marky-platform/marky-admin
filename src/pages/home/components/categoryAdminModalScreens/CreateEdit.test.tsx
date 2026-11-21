import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../../themes/light";
import { CreateEdit } from "./CreateEdit";

jest.mock("../../../../hooks/useCreateProductCategory", () => ({
  __esModule: true,
  default: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock("../../../../hooks/useUpdateProductCategory", () => ({
  __esModule: true,
  default: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock("../../../../utils/utils", () => ({ ShowNotification: jest.fn() }));

describe("CreateEdit icon picker", () => {
  it("expone el ícono elegido con aria-pressed", () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <CreateEdit
          initialCategory={
            { id: 1, label: "Pizzas", icon: "asado", order: 0 } as any
          }
          onSubmit={jest.fn()}
        />
      </ThemeProvider>
    );
    expect(
      screen.getByRole("button", { name: "asado", pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { pressed: true })
    ).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "bagette", pressed: false })
    ).toBeInTheDocument();
  });
});
