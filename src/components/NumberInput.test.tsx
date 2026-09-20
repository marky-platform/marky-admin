import { render, screen, fireEvent } from "@testing-library/react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import NumberInput from "./NumberInput";

const renderField = () =>
  render(
    <Formik initialValues={{ rate: "" }} onSubmit={() => {}}>
      <Form>
        <Field component={NumberInput} name="rate" label="Tasa de cambio" />
      </Form>
    </Formik>,
  );

describe("NumberInput decimal limit (Configuration Step 3 exchange rate)", () => {
  it("truncates typed input to 2 decimal digits", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "667,05678" } });
    expect(input).toHaveValue("667,05");
  });

  it("keeps a value with exactly 2 decimals untouched", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1,50" } });
    expect(input).toHaveValue("1,50");
  });
});

describe("NumberInput accepts dot or comma as decimal separator (ticket: unify decimal price format)", () => {
  it("treats a dot as the decimal separator instead of a thousands separator", () => {
    renderField();
    const input = screen.getByRole("textbox");
    // Previously "0.8" was stripped of its dot and saved as "08" (8) instead of 0.8.
    fireEvent.change(input, { target: { value: "0.8" } });
    expect(input).toHaveValue("0,8");
  });

  it("truncates dot-separated input to 2 decimal digits", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "667.05678" } });
    expect(input).toHaveValue("667,05");
  });

  it("only honors the last separator typed, discarding earlier ones", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1.234,5" } });
    expect(input).toHaveValue("1234,5");
  });
});

describe("NumberInput normalizes the display on blur", () => {
  it("pads a comma value to 2 decimals on blur", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "0,4" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("0,40");
  });

  it("pads a dot value to 2 decimals on blur", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "0.8" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("0,80");
  });

  it("pads an integer to 2 decimals on blur", () => {
    renderField();
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(input).toHaveValue("1,00");
  });
});

describe("NumberInput forwards sx to its FormControl", () => {
  it("applies a maxWidth passed via sx to the rendered FormControl", () => {
    render(
      <Formik initialValues={{ price: "" }} onSubmit={() => {}}>
        <Form>
          <Field
            component={NumberInput}
            name="price"
            label="Precio"
            sx={{ maxWidth: 238 }}
          />
        </Form>
      </Formik>,
    );
    const formControl = screen.getByTestId("number-input-form-control");
    expect(getComputedStyle(formControl).maxWidth).toBe("238px");
  });
});

describe("NumberInput error display for a nested array field (Variaciones/Adicionales price)", () => {
  const renderNestedField = () =>
    render(
      <Formik
        initialValues={{ items: [{ price: "" }] }}
        validationSchema={Yup.object({
          items: Yup.array().of(
            Yup.object({
              price: Yup.string().required("El precio es obligatorio"),
            }),
          ),
        })}
        onSubmit={() => {}}
      >
        <Form>
          <Field
            component={NumberInput}
            name="items[0].price"
            label="Precio"
            required
          />
        </Form>
      </Formik>,
    );

  it("shows the field as errored once touched, like a top-level field would", async () => {
    renderNestedField();
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);
    expect(
      await screen.findByText("El precio es obligatorio"),
    ).toBeInTheDocument();
  });
});
