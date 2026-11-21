import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { Formik } from "formik";
import lightTheme from "../themes/light";
import CategorySelectionList from "./CategorySelectionList";
import BusinessTypeSelectorField from "./BusinessTypeSelectorField";
import SelectButtonField from "./SelectButtonField";
import ProductCategorySelectionList from "../pages/product/components/ProductCategorySelectionList";

const wrap = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

const cats = [
  { id: 1, name: "Pizzas", label: "Pizzas", icon: "x", order: 0 },
  { id: 2, name: "Sushi", label: "Sushi", icon: "x", order: 1 },
] as any;

describe("tiles de selección exponen aria-pressed", () => {
  it("CategorySelectionList", () => {
    wrap(
      <CategorySelectionList
        categories={cats}
        maxSelectable={2}
        selected={[cats[0]]}
      />
    );
    expect(
      screen.getByRole("button", { name: /Pizzas/, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sushi/, pressed: false })
    ).toBeInTheDocument();
  });

  it("ProductCategorySelectionList", () => {
    wrap(
      <ProductCategorySelectionList
        categories={cats}
        maxSelectable={2}
        selected={[cats[1]]}
      />
    );
    expect(
      screen.getByRole("button", { name: /Sushi/, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pizzas/, pressed: false })
    ).toBeInTheDocument();
  });

  it("BusinessTypeSelectorField", () => {
    wrap(
      <Formik initialValues={{ type: "commercial" }} onSubmit={jest.fn()}>
        {({ values, setFieldValue }) => (
          <BusinessTypeSelectorField
            field={{ name: "type", value: values.type } as any}
            form={{ setFieldValue, touched: {}, errors: {} } as any}
            meta={{} as any}
            options={[
              { value: "commercial", label: "Comercial", description: "d" } as any,
              { value: "entrepreneur", label: "Emprendedor", description: "d" } as any,
            ]}
          />
        )}
      </Formik>
    );
    expect(
      screen.getByRole("button", { name: /Comercial/, pressed: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Emprendedor/, pressed: false })
    ).toBeInTheDocument();
  });
});

describe("SelectButtonField", () => {
  it("sin onClick no se expone como botón enfocable", () => {
    wrap(
      <SelectButtonField onClick={undefined as any} displayText="Hola" />
    );
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("con onClick es un botón activable con teclado", () => {
    const onClick = jest.fn();
    wrap(<SelectButtonField onClick={onClick} displayText="Hola" />);
    const btn = screen.getByRole("button");
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
