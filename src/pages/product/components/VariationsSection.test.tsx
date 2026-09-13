import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { Formik } from "formik";
import lightTheme from "../../../themes/light";
import VariationsSection from "./VariationsSection";

// useBusinessAccountInfo transitively imports axiosConfig -> axios, whose
// installed version ships ESM-only and breaks CRA's default Jest transform.
// Mock it out, same as ProductCard.test.tsx / ProductPromotionModal.test.tsx
// do for productService.
jest.mock("../../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({ data: { primary_currency_code: "PYG" } }),
}));

interface Variant {
  id?: number;
  name: string;
  description?: string;
  price: number | string;
  image?: unknown;
  _delete?: boolean;
}

const renderSection = (variants: Variant[]) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <Formik initialValues={{ variants }} onSubmit={() => {}}>
        {(formikProps) => (
          <>
            <VariationsSection
              {...formikProps}
              multiPresentation
              onMultiPresentationChange={() => {}}
            />
            <pre data-testid="variants-debug">
              {JSON.stringify(formikProps.values.variants)}
            </pre>
          </>
        )}
      </Formik>
    </ThemeProvider>,
  );

const readVariants = (): Variant[] =>
  JSON.parse(screen.getByTestId("variants-debug").textContent || "[]");

describe("VariationsSection", () => {
  it("adds a new row without an id, so the backend creates it instead of treating it as an update to an existing row", () => {
    renderSection([]);

    fireEvent.click(screen.getByText("Añadir otra presentación"));

    const variants = readVariants();
    expect(variants).toHaveLength(1);
    expect(variants[0]).not.toHaveProperty("id");
  });

  it("soft-deletes a persisted row (flags _delete, keeps it in the array) instead of splicing it out, and hides it from view", () => {
    renderSection([
      { id: 20, name: "Chico", price: 5, image: "https://example.com/a.jpg" },
      { id: 21, name: "Grande", price: 8, image: "https://example.com/b.jpg" },
    ]);

    expect(screen.getAllByTestId("DeleteIcon")).toHaveLength(2);

    const [firstDelete] = screen.getAllByTestId("DeleteIcon");
    fireEvent.click(firstDelete);

    const variants = readVariants();
    expect(variants).toHaveLength(2);
    expect(variants[0]).toMatchObject({ id: 20, _delete: true });
    expect(variants[1]).toMatchObject({ id: 21 });
    expect(variants[1]._delete).toBeFalsy();

    // the deleted row is no longer rendered
    expect(screen.getAllByTestId("DeleteIcon")).toHaveLength(1);
    expect(screen.queryByDisplayValue("Chico")).not.toBeInTheDocument();
  });

  it("removes a never-saved row (no id) outright instead of tombstoning it", () => {
    renderSection([{ name: "Nueva presentación", price: "", image: null }]);

    fireEvent.click(screen.getAllByTestId("DeleteIcon")[0]);

    expect(readVariants()).toHaveLength(0);
  });

  it("counts only visible (non-deleted) rows against the max-items limit", () => {
    const variants: Variant[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Presentación ${i + 1}`,
      price: 1,
      image: "https://example.com/img.jpg",
    }));
    renderSection(variants);

    const addButton = screen.getByRole("button", {
      name: "Añadir otra presentación",
    });

    // at the limit: the "add" button is disabled
    expect(addButton).toBeDisabled();

    // soft-delete one row -> a free slot opens up even though the array
    // still has 10 entries (the tombstoned one hasn't been sent yet)
    fireEvent.click(screen.getAllByTestId("DeleteIcon")[0]);

    expect(addButton).not.toBeDisabled();
  });

  it("caps Nombre de presentación and Descripción at 32 characters via the native maxLength attribute", () => {
    renderSection([{ name: "", description: "", price: "", image: null }]);

    const nameInput = screen.getByPlaceholderText("Nombre de presentación");
    const descriptionInput = screen.getByPlaceholderText("Descripción");

    expect(nameInput).toHaveAttribute("maxlength", "32");
    expect(descriptionInput).toHaveAttribute("maxlength", "32");
  });

  it("shows a 0/32 -> 32/32 character counter on Descripción that never goes negative", () => {
    const thirtyTwoChars = "a".repeat(32);
    renderSection([
      { name: "Chico", description: "", price: 5, image: null },
      { name: "Grande", description: thirtyTwoChars, price: 8, image: null },
    ]);

    expect(screen.getByText("0/32")).toBeInTheDocument();
    expect(screen.getByText("32/32")).toBeInTheDocument();
  });
});
