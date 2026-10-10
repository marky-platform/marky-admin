import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../themes/light";
import BusinessProfilePanel from "./BusinessProfilePanel";

const baseProps = {
  name: "Mi Negocio",
  categoriesText: "Panadería",
  photo: null,
  description: "",
  attributes: [],
  socialMedia: {} as any,
  locations: [],
};

const renderPanel = (props: Record<string, unknown> = {}) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <BusinessProfilePanel {...baseProps} {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe("BusinessProfilePanel title action", () => {
  it("renders the title action slot next to the business name", () => {
    renderPanel({
      titleActionSlot: <button aria-label="Editar perfil">edit</button>,
    });

    expect(screen.getByText("Mi Negocio")).toBeInTheDocument();
    expect(screen.getByLabelText("Editar perfil")).toBeInTheDocument();
  });

  it("renders no edit control when no title action is given (public profile)", () => {
    renderPanel({ readOnly: true });

    expect(screen.queryByLabelText("Editar perfil")).not.toBeInTheDocument();
  });
});
