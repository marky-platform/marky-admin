import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import lightTheme from "../../../themes/light";
import { ROUTES } from "../../../routes/paths";
import EmptyProducts from "./EmptyProducts";

const renderEmpty = (onCreateCategory?: () => void, notice?: string) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <EmptyProducts
                businessName="Mi Negocio"
                onCreateCategory={onCreateCategory}
                notice={notice}
              />
            }
          />
          <Route
            path={ROUTES.PRODUCT_CREATE}
            element={<div>pantalla-crear-producto</div>}
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe("EmptyProducts", () => {
  it("offers both prototype actions", () => {
    renderEmpty(jest.fn());

    expect(
      screen.getByRole("button", { name: "Crear una categoría" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Agregar mi primer producto" }),
    ).toBeInTheDocument();
  });

  it("shows the notice when given", () => {
    renderEmpty(jest.fn(), "Categoría «Postres» creada.");

    expect(screen.getByText("Categoría «Postres» creada.")).toBeInTheDocument();
  });

  it("calls onCreateCategory from the secondary action", () => {
    const onCreateCategory = jest.fn();
    renderEmpty(onCreateCategory);

    fireEvent.click(screen.getByRole("button", { name: "Crear una categoría" }));
    expect(onCreateCategory).toHaveBeenCalledTimes(1);
  });

  it("navigates to the product-create route from the primary action", () => {
    renderEmpty(jest.fn());

    fireEvent.click(
      screen.getByRole("button", { name: "Agregar mi primer producto" }),
    );
    expect(screen.getByText("pantalla-crear-producto")).toBeInTheDocument();
  });
});
