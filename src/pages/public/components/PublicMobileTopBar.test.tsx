import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import PublicMobileTopBar from "./PublicMobileTopBar";

describe("PublicMobileTopBar", () => {
  const renderBar = () =>
    render(
      <ThemeProvider theme={lightTheme}>
        <PublicMobileTopBar businessPhoto="" />
      </ThemeProvider>,
    );

  it("offers share, copy URL, QR and a destructive Report item", () => {
    renderBar();

    fireEvent.click(screen.getByRole("button", { name: "Más acciones" }));

    expect(screen.getAllByRole("menuitem").map((i) => i.textContent)).toEqual([
      "Compartir perfil",
      "Copiar URL del perfil",
      "Código QR",
      "Reportar",
    ]);
    expect(screen.getByRole("menuitem", { name: "Reportar" })).toHaveStyle({
      color: lightTheme.palette.error.main,
    });
  });

  it("is read-only: no edit control, no notifications, no account menu", () => {
    renderBar();

    expect(screen.queryByLabelText("Editar perfil")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("user-menu")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/notific/i)).not.toBeInTheDocument();
  });
});
