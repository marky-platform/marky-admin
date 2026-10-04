import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import lightTheme from "../../../themes/light";
import { Product } from "../../../types/product";
import { defaultPresentationForm } from "../../../utils/productExtras";
import PresentationSection from "./PresentationSection";

const renderSection = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <Formik
        initialValues={
          { presentationForm: defaultPresentationForm() } as unknown as Product
        }
        onSubmit={() => {}}
      >
        {(formik) => (
          <>
            <PresentationSection formik={formik} />
            <output data-testid="state">
              {JSON.stringify(formik.values.presentationForm)}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>,
  );

const state = () => JSON.parse(screen.getByTestId("state").textContent || "{}");

describe("PresentationSection", () => {
  it("shows the Opcional hint and the three module titles", () => {
    renderSection();
    expect(screen.getByText("Presentación")).toBeInTheDocument();
    expect(screen.getByText("Opcional")).toBeInTheDocument();
    expect(
      screen.getByText("¿Cómo se mide este producto?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tamaño")).toBeInTheDocument();
    expect(screen.getByText("Rendimiento aproximado")).toBeInTheDocument();
  });

  it("hides dependent controls until a module is switched on", () => {
    renderSection();
    expect(
      screen.queryByRole("radiogroup", { name: "Tipo de cantidad" }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "¿Cómo se mide este producto?" }),
    );
    expect(
      screen.getByRole("radiogroup", { name: "Tipo de cantidad" }),
    ).toBeInTheDocument();
  });

  it("does not leak value/unit when switching amount type or turning the module off", () => {
    renderSection();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "¿Cómo se mide este producto?" }),
    );
    fireEvent.click(screen.getByLabelText("Peso"));
    fireEvent.change(screen.getByRole("textbox", { name: "Cantidad" }), {
      target: { value: "1,5" },
    });
    expect(state()).toMatchObject({
      amountType: "weight",
      amountValue: "1,5",
      amountUnit: "g",
    });

    fireEvent.click(screen.getByLabelText("Volumen"));
    expect(state()).toMatchObject({
      amountType: "volume",
      amountValue: "",
      amountUnit: "ml",
    });

    fireEvent.change(screen.getByRole("textbox", { name: "Cantidad" }), {
      target: { value: "500" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "¿Cómo se mide este producto?" }),
    );
    expect(state()).toMatchObject({
      amountEnabled: false,
      amountValue: "",
      amountType: "units",
    });
  });

  it("clears fields exclusive to the previous shape and everything when turned off", () => {
    renderSection();
    fireEvent.click(screen.getByRole("checkbox", { name: "Tamaño" }));
    fireEvent.change(screen.getByLabelText("Diámetro"), {
      target: { value: "20" },
    });
    fireEvent.change(screen.getByLabelText("Alto (opcional)"), {
      target: { value: "8" },
    });

    fireEvent.click(screen.getByLabelText("Rectangular"));
    expect(state()).toMatchObject({
      shape: "rectangular",
      diameterCm: "",
      heightCm: "8",
    });

    fireEvent.change(screen.getByLabelText("Largo"), {
      target: { value: "30" },
    });
    fireEvent.click(screen.getByLabelText("Redondo"));
    expect(state()).toMatchObject({
      shape: "round",
      lengthCm: "",
      widthCm: "",
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "Tamaño" }));
    expect(state()).toMatchObject({
      dimensionsEnabled: false,
      diameterCm: "",
      heightCm: "",
    });
  });

  it("steps the yield (exact value, no range) and clears it when switched off", () => {
    renderSection();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Rendimiento aproximado" }),
    );
    expect(state()).toMatchObject({ yieldEnabled: true, minPeople: "1" });
    expect(screen.getByLabelText("Menos personas")).toBeDisabled();
    expect(screen.queryByLabelText("Hasta (opcional)")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Más personas"));
    expect(state().minPeople).toBe("2");
    expect(screen.getByText("personas")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Rendimiento aproximado" }),
    );
    expect(state()).toMatchObject({
      yieldEnabled: false,
      minPeople: "",
      maxPeople: "",
    });
  });
});
