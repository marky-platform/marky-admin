import { ThemeProvider } from "@mui/material/styles";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import lightTheme from "../../../themes/light";
import { defaultCeliacForm } from "../../../utils/productExtras";
import AllergensSection from "./AllergensSection";
import CeliacSection from "./CeliacSection";
import FeaturedIngredientsField from "./FeaturedIngredientsField";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

const IngredientsHarness = () => {
  const [value, setValue] = useState<string[]>([]);
  return <FeaturedIngredientsField value={value} onChange={setValue} />;
};

describe("FeaturedIngredientsField", () => {
  const open = () =>
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar ingrediente" }),
    );
  const add = (text: string) => {
    open();
    const input = screen.getByLabelText("Nuevo ingrediente");
    fireEvent.change(input, { target: { value: text } });
    fireEvent.keyDown(input, { key: "Enter" });
  };

  it("shows the label, the muted max hint and the helper text", () => {
    wrap(<IngredientsHarness />);
    expect(screen.getByText("Ingredientes destacados")).toBeInTheDocument();
    expect(screen.getByText("Máx. 8")).toBeInTheDocument();
    expect(
      screen.getByText(/Agrega los ingredientes que ayudan a entender mejor/),
    ).toBeInTheDocument();
    // el input solo aparece tras pulsar "+"
    expect(
      screen.queryByLabelText("Nuevo ingrediente"),
    ).not.toBeInTheDocument();
  });

  it("adds trimmed tags, rejects case-insensitive duplicates and hides + at 8", () => {
    wrap(<IngredientsHarness />);
    add("  Tomate ");
    expect(screen.getAllByText("Tomate")).toHaveLength(1);
    // duplicado: el input sigue abierto con el error
    open();
    const input = screen.getByLabelText("Nuevo ingrediente");
    fireEvent.change(input, { target: { value: "tomate" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(
      screen.getByText("Ese ingrediente ya fue agregado"),
    ).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(
      screen.queryByLabelText("Nuevo ingrediente"),
    ).not.toBeInTheDocument();
    for (let i = 0; i < 7; i++) add(`ing${i}`);
    expect(screen.getAllByRole("listitem")).toHaveLength(8);
    expect(
      screen.queryByRole("button", { name: "Agregar ingrediente" }),
    ).not.toBeInTheDocument();
  });

  it("confirms with the check button, cancels with Escape and removes pills", () => {
    wrap(<IngredientsHarness />);
    open();
    fireEvent.change(screen.getByLabelText("Nuevo ingrediente"), {
      target: { value: "Café" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar ingrediente" }),
    );
    expect(screen.getByText("Café")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Nuevo ingrediente"),
    ).not.toBeInTheDocument();

    open();
    fireEvent.change(screen.getByLabelText("Nuevo ingrediente"), {
      target: { value: "Leche" },
    });
    fireEvent.keyDown(screen.getByLabelText("Nuevo ingrediente"), {
      key: "Escape",
    });
    expect(screen.queryByText("Leche")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quitar Café" }));
    expect(screen.queryByText("Café")).not.toBeInTheDocument();
  });
});

describe("AllergensSection", () => {
  const Harness = () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <>
        <AllergensSection value={value} onChange={setValue} />
        <output data-testid="value">{value.join(",")}</output>
      </>
    );
  };

  it("keeps changes local until confirmed, and cancel restores the saved selection", async () => {
    wrap(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Leche" }));
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(
      () => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByTestId("value")).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Leche" }));
    fireEvent.click(screen.getByText("Asignar alérgenos"));
    await waitFor(
      () => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      { timeout: 5000 },
    );
    expect(screen.getByTestId("value")).toHaveTextContent("milk");
    expect(screen.getByText("Leche")).toBeInTheDocument();

    // reopen, change, cancel => saved selection stays
    // la misma acción sigue disponible con alérgenos ya seleccionados
    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Huevo" }));
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.getByTestId("value")).toHaveTextContent("milk");
  }, 15000);

  it("shows header copy, removable pills and the add action below them", async () => {
    wrap(<Harness />);
    expect(screen.getByText("Alérgenos")).toBeInTheDocument();
    expect(screen.getByText("Opcional")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona los alérgenos presentes en este producto."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Editar")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    const dialog = screen.getByRole("dialog", { name: "Alérgenos" });
    // sin checkbox nativo a la izquierda; la fila expone el estado
    expect(
      within(dialog).queryByTestId("CheckBoxOutlineBlankIcon"),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByTestId("CheckBoxIcon"),
    ).not.toBeInTheDocument();
    const row = within(dialog).getByRole("checkbox", { name: "Huevo" });
    expect(row).toHaveAttribute("aria-checked", "false");
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-checked", "true");
    fireEvent.click(within(dialog).getByText("Asignar alérgenos"));
    await waitFor(
      () => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      { timeout: 5000 },
    );

    fireEvent.click(screen.getByRole("button", { name: "Quitar Huevo" }));
    expect(screen.getByTestId("value")).toHaveTextContent("");
  }, 15000);

  it("keeps unconfirmed changes when the parent re-renders with a new array reference", () => {
    const { rerender } = wrap(
      <AllergensSection value={[]} onChange={() => {}} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Leche" }));
    rerender(
      <ThemeProvider theme={lightTheme}>
        <AllergensSection value={[]} onChange={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByRole("checkbox", { name: "Leche" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("searches ignoring case and accents", () => {
    wrap(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Agregar alérgeno" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(
      within(dialog).getByLabelText("Buscar alérgeno por nombre"),
      {
        target: { value: "MANI" },
      },
    );
    expect(within(dialog).getByText("Maní")).toBeInTheDocument();
    expect(within(dialog).queryByText("Leche")).not.toBeInTheDocument();
  });
});

describe("CeliacSection layout", () => {
  it("shows the helper copy, nested container title and footnote only when on", () => {
    wrap(<CeliacSection value={defaultCeliacForm()} onChange={() => {}} />);
    expect(
      screen.getByText(
        "Activa este filtro si tu producto está dirigido para personas con celiaquía.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Apto para celíacos (SIN TACC)"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/^\*El nivel de certificación/),
    ).not.toBeInTheDocument();
  });

  it("renders the three declarations, title and footnote when enabled", () => {
    wrap(
      <CeliacSection
        value={{ ...defaultCeliacForm(), enabled: true }}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByText("Apto para celíacos (SIN TACC)"),
    ).toBeInTheDocument();
    [
      "Control de contaminación cruzada",
      "Sin trigo, avena, cebada ni centeno",
      "Protocolo declarado o certificación",
    ].forEach((label) =>
      expect(screen.getByLabelText(label)).toBeInTheDocument(),
    );
    expect(
      screen.getByText(
        "*El nivel de certificación se detalla en el detalle del producto, sus clientes podrán verlo.",
      ),
    ).toBeInTheDocument();
  });
});

describe("CeliacSection", () => {
  const Harness = () => {
    const [value, setValue] = useState(defaultCeliacForm());
    return (
      <>
        <CeliacSection value={value} onChange={setValue} />
        <output data-testid="value">{JSON.stringify(value)}</output>
      </>
    );
  };

  it("resets all declarations when the master switch is turned off", () => {
    wrap(<Harness />);
    const master = screen.getByRole("checkbox", {
      name: "Control para Celíacos (SIN TACC)",
    });
    fireEvent.click(master);
    // enabling selects nothing
    expect(screen.getByTestId("value")).toHaveTextContent(
      '"crossContaminationControl":false',
    );
    fireEvent.click(screen.getByLabelText("Control de contaminación cruzada"));
    fireEvent.click(
      screen.getByLabelText("Protocolo declarado o certificación"),
    );
    expect(screen.getByTestId("value")).toHaveTextContent(
      '"certifiedProtocol":true',
    );

    fireEvent.click(master);
    expect(screen.getByTestId("value")).toHaveTextContent(
      JSON.stringify(defaultCeliacForm()),
    );
    expect(
      screen.queryByLabelText("Control de contaminación cruzada"),
    ).not.toBeInTheDocument();
  });
});
