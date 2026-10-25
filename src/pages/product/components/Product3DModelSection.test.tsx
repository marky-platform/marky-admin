import { ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen } from "@testing-library/react";
import { Formik } from "formik";
import lightTheme from "../../../themes/light";
import { Product } from "../../../types/product";
import { ShowNotification } from "../../../utils/utils";
import Product3DModelSection from "./Product3DModelSection";

jest.mock("../../../utils/utils", () => ({ ShowNotification: jest.fn() }));

const renderSection = (model3d: any = null, extra: any = {}) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <Formik
        initialValues={{ model3d } as unknown as Product}
        initialErrors={extra.errors}
        onSubmit={() => {}}
      >
        {(formik) => (
          <>
            <Product3DModelSection {...extra.props} />
            <output data-testid="state">
              {JSON.stringify(formik.values.model3d, (_k, v) =>
                v instanceof File ? `File:${v.name}` : v,
              )}
            </output>
          </>
        )}
      </Formik>
    </ThemeProvider>,
  );

const state = () => JSON.parse(screen.getByTestId("state").textContent || "null");
const pick = (testId: string, file: File) =>
  fireEvent.change(screen.getByTestId(testId), { target: { files: [file] } });

describe("Product3DModelSection", () => {
  beforeEach(() => (ShowNotification as jest.Mock).mockClear());

  it("renders Spanish labels and the empty state", () => {
    renderSection();
    expect(screen.getByText("Modelo 3D y realidad aumentada")).toBeInTheDocument();
    expect(screen.getByText("Opcional")).toBeInTheDocument();
    expect(screen.getByText("GLB (obligatorio para el modelo)")).toBeInTheDocument();
    expect(screen.getByText("USDZ (opcional)")).toBeInTheDocument();
    expect(screen.queryByText("Quitar")).not.toBeInTheDocument();
  });

  it("selects a GLB and a USDZ", () => {
    renderSection();
    pick("model3d-glb-input", new File(["glTF"], "silla.glb"));
    expect(state().glbFile).toBe("File:silla.glb");
    expect(screen.getByText("silla.glb (1 KB)")).toBeInTheDocument();
    pick("model3d-usdz-input", new File(["PK"], "silla.usdz"));
    expect(state().usdzFile).toBe("File:silla.usdz");
  });

  it("rejects an invalid file with a toast", () => {
    renderSection();
    pick("model3d-glb-input", new File(["x"], "silla.obj"));
    expect(ShowNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
    expect(state()).toBeNull();
  });

  it("shows the file name taken from the URL for existing files", () => {
    renderSection({ id: 1, glbFile: "http://x/media/product_3d/mesa.glb", usdzFile: null });
    expect(screen.getByText("mesa.glb")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reemplazar GLB" })).toBeInTheDocument();
  });

  it("removing the USDZ of an existing model sets removeUsdz", () => {
    renderSection({ id: 1, glbFile: "http://x/a.glb", usdzFile: "http://x/a.usdz" });
    fireEvent.click(screen.getByRole("button", { name: "Quitar USDZ" }));
    expect(state()).toMatchObject({ id: 1, usdzFile: null, removeUsdz: true });
  });

  it("removing the USDZ after replacing it still sets removeUsdz", () => {
    renderSection({ id: 1, glbFile: "http://x/a.glb", usdzFile: "http://x/a.usdz" });
    pick("model3d-usdz-input", new File(["PK"], "n.usdz"));
    fireEvent.click(screen.getByRole("button", { name: "Quitar USDZ" }));
    expect(state()).toMatchObject({ id: 1, usdzFile: null, removeUsdz: true });
  });

  it("rejects a USDZ while a delete is pending", () => {
    renderSection({ id: 1, glbFile: "http://x/a.glb", usdzFile: null, _delete: true });
    pick("model3d-usdz-input", new File(["PK"], "n.usdz"));
    expect(state()._delete).toBe(true);
    expect(ShowNotification).toHaveBeenCalledWith({
      message: "Sube primero el archivo GLB.",
      type: "error",
    });
  });

  it("removing the GLB of an existing model marks it _delete; of a new one clears it", () => {
    const { unmount } = renderSection({ id: 1, glbFile: "http://x/a.glb" });
    fireEvent.click(screen.getByRole("button", { name: "Quitar GLB" }));
    expect(state()).toMatchObject({ id: 1, _delete: true });
    unmount();

    renderSection({ glbFile: new File(["glTF"], "n.glb") });
    fireEvent.click(screen.getByRole("button", { name: "Quitar GLB" }));
    expect(state()).toBeNull();
  });

  it("shows upload progress on pending files while saving", () => {
    renderSection(
      { glbFile: new File(["glTF"], "n.glb") },
      { props: { isSaving: true, uploadProgress: 40 } },
    );
    expect(screen.getByText("Subiendo...40%")).toBeInTheDocument();
  });

  it("shows the validation error", () => {
    renderSection(
      { usdzFile: new File(["PK"], "a.usdz"), glbFile: null },
      { errors: { model3d: "Para agregar el modelo 3D sube primero el archivo GLB." } },
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/sube primero el archivo GLB/);
  });
});
