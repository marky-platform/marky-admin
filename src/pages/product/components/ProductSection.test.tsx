import { ThemeProvider } from "@mui/material/styles";
import { render, screen } from "@testing-library/react";
import { Formik } from "formik";
import lightTheme from "../../../themes/light";
import ProductSection from "./ProductSection";

jest.mock("../../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({ data: { primary_currency_code: "PYG" } }),
}));
jest.mock("../../../hooks/useProductCategories", () => ({
  __esModule: true,
  default: () => ({ data: { results: [] } }),
}));
jest.mock("./ProductImageGallery", () => ({
  __esModule: true,
  default: () => <div />,
}));

const renderSection = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <Formik
        initialValues={{ name: "", description: "", price: 0 } as any}
        onSubmit={() => {}}
      >
        {(formik) => (
          <ProductSection
            formik={formik}
            onCreateCategory={() => {}}
            onSelectCategory={() => {}}
            selectedCategory={null}
          />
        )}
      </Formik>
    </ThemeProvider>,
  );

describe("ProductSection", () => {
  it("shows the currency in the price label, not inside the input", () => {
    renderSection();
    expect(screen.getByText(/Precio en PYG/)).toBeInTheDocument();
    expect(screen.queryByText("[PYG]")).not.toBeInTheDocument();
  });

  it("uses the new description label", () => {
    renderSection();
    expect(
      screen.getByText(/Cuenta qué hace especial a este producto/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Descripción")).not.toBeInTheDocument();
  });
});
