import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import PreviewPanel from "./PreviewPanel";
import { Product } from "../../../types/product";

jest.mock("../../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({ data: { primary_currency_code: "PYG" } }),
}));

const renderPreview = (values: Partial<Product>) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <PreviewPanel
        section="Producto"
        selectedCategory={null}
        values={{ name: "Pizza", price: 10, media: [], ...values } as Product}
      />
    </ThemeProvider>,
  );

describe("PreviewPanel 3D placeholder", () => {
  it("shows a static 3D tile when the form has a GLB, without mounting a viewer", () => {
    renderPreview({
      model3d: { glbFile: new File(["glTF"], "pizza.glb") },
    });

    expect(screen.getByRole("img", { name: "Modelo 3D" })).toHaveTextContent("3D");
    expect(screen.queryByTestId("model-viewer-element")).not.toBeInTheDocument();
  });

  it("shows no 3D tile without a model or when it is marked for deletion", () => {
    renderPreview({ model3d: null });
    expect(screen.queryByRole("img", { name: "Modelo 3D" })).not.toBeInTheDocument();

    renderPreview({ model3d: { id: 1, glbFile: "https://cdn.test/a.glb", _delete: true } });
    expect(screen.queryByRole("img", { name: "Modelo 3D" })).not.toBeInTheDocument();
  });
});
