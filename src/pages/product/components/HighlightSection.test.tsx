import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import HighlightSection from "./HighlightSection";
import { cssForClosest, cssForSelector } from "../../../components/cssTestUtils";

const baseValues = {
  stopper: "",
  isPromotionActive: true,
  promotionOption: "descuento",
  discountPercentage: "25",
  multibuyOption: "",
  countdownActive: false,
};

const renderSection = (values: any = baseValues) => {
  const setValues = jest.fn();
  const setFieldValue = jest.fn();
  render(
    <ThemeProvider theme={lightTheme}>
      <HighlightSection
        {...({
          values,
          setValues,
          setFieldValue,
          errors: {},
          touched: {},
        } as any)}
      />
    </ThemeProvider>,
  );
  return { setValues, setFieldValue };
};

describe("HighlightSection promotion fields (mobile overflow)", () => {
  it("discount field has no left margin on mobile and keeps its desktop indent", () => {
    renderSection();
    const css = cssForClosest(
      screen.getByPlaceholderText("Porcentaje de descuento (0-100)"),
      ".MuiTextField-root",
    );
    expect(css).toMatch(/min-width:\s*0px\)\s*\{[^}]*margin-left: 0/s);
    expect(css).toMatch(/min-width:\s*900px\)\s*\{[^}]*margin-left: 32px/s);
    expect(css).toMatch(/width: 100%/);
    expect(css).toMatch(/min-width: 0/);
  });

  it("uses a more compact input padding on mobile only", () => {
    renderSection();
    const css = cssForClosest(
      screen.getByPlaceholderText("Porcentaje de descuento (0-100)"),
      ".MuiTextField-root",
    );
    expect(css).toMatch(/min-width:\s*0px\)[^@]*padding: 8px/s);
    expect(css).toMatch(/min-width:\s*900px\)[^@]*padding: 12px/s);
  });

  it("applies the same geometry to the Oferta select", () => {
    renderSection({
      ...baseValues,
      promotionOption: "oferta",
      multibuyOption: "2x1",
      discountPercentage: "",
    });
    expect(cssForSelector(".MuiFormControl-root")).toMatch(
      /min-width:\s*0px\)\s*\{[^}]*margin-left: 0/s,
    );
  });

  it("still sanitizes discount input and clears it when switching to Oferta", () => {
    const { setFieldValue, setValues } = renderSection();
    fireEvent.change(
      screen.getByPlaceholderText("Porcentaje de descuento (0-100)"),
      { target: { value: "150" } },
    );
    expect(setFieldValue).toHaveBeenCalledWith(
      "discountPercentage",
      expect.any(String),
    );

    fireEvent.click(screen.getByLabelText("Oferta"));
    const updater = setValues.mock.calls[0][0];
    expect(updater({ promotionOption: "descuento" })).toMatchObject({
      promotionOption: "oferta",
      discountPercentage: "",
    });
  });
});
