import { render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { axe, toHaveNoViolations } from "jest-axe";
import lightTheme from "../themes/light";
import CatalogFilterPills from "./CatalogFilterPills";
import ConfirmationDialog from "./ConfirmationDialog";
import Input from "./Input";

expect.extend(toHaveNoViolations);

// Smoke de accesibilidad (jest-axe) sobre componentes compartidos sin red.
// Color-contrast no se evalúa: jsdom no calcula estilos reales.
const axeOptions = { rules: { "color-contrast": { enabled: false } } };

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe("jest-axe: componentes compartidos", () => {
  it("Input con label y error no tiene violaciones", async () => {
    const { container } = wrap(
      <Input label="Nombre" name="name" value="" error helperText="Requerido" />,
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("CatalogFilterPills no tiene violaciones", async () => {
    const { container } = wrap(
      <CatalogFilterPills offer={false} featured onChange={jest.fn()} />,
    );
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });

  it("ConfirmationDialog abierto no tiene violaciones", async () => {
    const { baseElement } = wrap(
      <ConfirmationDialog
        open
        title="Eliminar producto"
        content="Esta acción no se puede deshacer."
        onClose={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );
    expect(await axe(baseElement, axeOptions)).toHaveNoViolations();
  });
});
