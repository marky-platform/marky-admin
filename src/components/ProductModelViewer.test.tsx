import { act, render, screen } from "@testing-library/react";
import ProductModelViewer from "./ProductModelViewer";

// Sin WebGL en JSDOM: el paquete real no se carga; <model-viewer> queda como
// un elemento desconocido sobre el que se despachan los eventos a mano.
jest.mock("@google/model-viewer", () => ({}));

const getViewer = () =>
  screen.getByTestId("model-viewer-element") as HTMLElement & {
    canActivateAR?: boolean;
  };

describe("ProductModelViewer", () => {
  it("renders model-viewer with the AR attributes and no ios-src without a USDZ", () => {
    render(
      <ProductModelViewer glbUrl="https://cdn.test/a.glb" alt="Modelo 3D de Pizza" />,
    );
    const viewer = getViewer();

    expect(viewer).toHaveAttribute("src", "https://cdn.test/a.glb");
    expect(viewer).toHaveAttribute("alt", "Modelo 3D de Pizza");
    expect(viewer).toHaveAttribute("ar");
    expect(viewer).toHaveAttribute("camera-controls");
    expect(viewer).toHaveAttribute("ar-modes", "webxr scene-viewer quick-look");
    expect(viewer).toHaveAttribute("ar-placement", "floor");
    expect(viewer).toHaveAttribute("touch-action", "pan-y");
    expect(viewer).not.toHaveAttribute("ios-src");
  });

  it("sets ios-src only when a USDZ is given", () => {
    render(
      <ProductModelViewer
        glbUrl="https://cdn.test/a.glb"
        usdzUrl="https://cdn.test/a.usdz"
        alt="Modelo 3D de Pizza"
      />,
    );

    expect(getViewer()).toHaveAttribute(
      "ios-src",
      "https://cdn.test/a.usdz",
    );
  });

  it("hides the AR button until the model loads on an AR-capable device", () => {
    render(<ProductModelViewer glbUrl="a.glb" alt="Modelo 3D de Pizza" />);
    const viewer = getViewer() as ReturnType<typeof getViewer> & {
      activateAR?: () => Promise<void>;
    };
    const activateAR = jest.fn().mockResolvedValue(undefined);
    viewer.activateAR = activateAR;

    expect(
      screen.queryByRole("button", { name: "Ver en tu espacio" }),
    ).not.toBeInTheDocument();

    viewer.canActivateAR = true;
    act(() => {
      viewer.dispatchEvent(new Event("load"));
    });
    screen.getByRole("button", { name: "Ver en tu espacio" }).click();
    expect(activateAR).toHaveBeenCalled();
  });

  it("never shows the AR button on devices without AR (desktop)", () => {
    render(<ProductModelViewer glbUrl="a.glb" alt="Modelo 3D de Pizza" />);
    const viewer = getViewer();

    viewer.canActivateAR = false;
    act(() => {
      viewer.dispatchEvent(new Event("load"));
    });
    expect(
      screen.queryByRole("button", { name: "Ver en tu espacio" }),
    ).not.toBeInTheDocument();
  });

  it("shows a progress bar while loading and hides it after load", () => {
    render(
      <ProductModelViewer glbUrl="a.glb" alt="Modelo 3D de Pizza" />,
    );
    expect(screen.getByLabelText("Cargando modelo 3D")).toBeInTheDocument();

    act(() => {
      getViewer().dispatchEvent(new Event("load"));
    });
    expect(screen.queryByLabelText("Cargando modelo 3D")).not.toBeInTheDocument();
  });

  it("shows the error state after an error event", () => {
    render(
      <ProductModelViewer glbUrl="a.glb" alt="Modelo 3D de Pizza" />,
    );

    act(() => {
      getViewer().dispatchEvent(new Event("error"));
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo cargar el modelo 3D",
    );
  });

  it("keeps the viewer when an AR session fails", () => {
    render(
      <ProductModelViewer glbUrl="a.glb" alt="Modelo 3D de Pizza" />,
    );
    const viewer = getViewer();

    act(() => {
      viewer.dispatchEvent(new Event("load"));
      viewer.dispatchEvent(
        new CustomEvent("ar-status", { detail: { status: "failed" } }),
      );
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getViewer()).toBeInTheDocument();
  });

  it.each([true, false])(
    "reports canActivateAR=%s through onArAvailability after load",
    (canAR) => {
      const onArAvailability = jest.fn();
      render(
        <ProductModelViewer
          glbUrl="a.glb"
          alt="Modelo 3D de Pizza"
          onArAvailability={onArAvailability}
        />,
      );
      const viewer = getViewer();
      viewer.canActivateAR = canAR;

      expect(onArAvailability).not.toHaveBeenCalled();
      act(() => {
        viewer.dispatchEvent(new Event("load"));
      });
      expect(onArAvailability).toHaveBeenCalledWith(canAR);
    },
  );
});
