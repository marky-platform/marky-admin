import { act, fireEvent, render, screen } from "@testing-library/react";
import QRCode from "qrcode";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import ProductDetailGallery from "./ProductDetailGallery";
import { Product } from "../../../types/product";

// Sin WebGL en JSDOM: el paquete real del visor 3D nunca se carga.
jest.mock("@google/model-viewer", () => ({}));
jest.mock("qrcode", () => ({
  __esModule: true,
  default: { toDataURL: jest.fn() },
}));

// JSDOM has no matchMedia: MUI's useMediaQuery then reports "no match" for
// every query, so tests opt into the mobile viewport (down("md")) explicitly.
const mockMobile = (isMobile: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: isMobile && query.includes("max-width"),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const image = (id: number) => ({
  id,
  file: `https://example.com/${id}.jpg`,
  media_type: "image",
  name: `thumb-${id}`,
});

const renderGallery = (
  media: any[],
  extra: Record<string, unknown> = {},
  props: { stickyTop?: number; initialView?: "3d"; publicUrl?: string } = {},
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ProductDetailGallery
        product={
          { id: 1, name: "Pizza", price: "10", media, ...extra } as unknown as Product
        }
        {...props}
      />
    </ThemeProvider>,
  );

afterEach(() => {
  delete (window as any).matchMedia;
});

describe("ProductDetailGallery thumbnail rail", () => {
  it("hides the thumbnail on mobile when there is exactly one image", () => {
    mockMobile(true);
    renderGallery([image(1)]);

    expect(screen.queryByAltText("thumb-1")).not.toBeInTheDocument();
    expect(screen.getByAltText("Pizza")).toBeInTheDocument();
  });

  it("keeps the thumbnails on mobile with two or more media items", () => {
    mockMobile(true);
    renderGallery([image(1), image(2)]);

    expect(screen.getByAltText("thumb-1")).toBeInTheDocument();
    expect(screen.getByAltText("thumb-2")).toBeInTheDocument();
  });

  it("keeps the single-image thumbnail on desktop", () => {
    mockMobile(false);
    renderGallery([image(1)]);

    expect(screen.getByAltText("thumb-1")).toBeInTheDocument();
  });
});

// JSDOM no evalúa media queries: se leen las reglas que emotion inyectó.
const rulesFor = (el: Element) => {
  const cls = Array.from(el.classList).find((c) => c.startsWith("css-"));
  return Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .filter((rule) => rule.cssText.includes(`.${cls}`))
    .map((rule) => rule.cssText);
};

describe("ProductDetailGallery media viewport", () => {
  it("has no internal padding so the media reaches all four edges", () => {
    renderGallery([image(1)]);
    const css = rulesFor(screen.getByTestId("product-detail-media")).join("\n");

    expect(css).not.toMatch(/padding/);
    expect(css).toMatch(/overflow:\s*hidden/);
  });
});

describe("ProductDetailGallery promotion badges", () => {
  it("shows the shared pill for a discount", () => {
    renderGallery([image(1)], { discountPercentage: 20 });

    expect(screen.getByText("-20%")).toBeInTheDocument();
    expect(getComputedStyle(screen.getByTestId("product-badge")).borderRadius).toBe(
      "24px",
    );
  });

  it("shows the multibuy pill", () => {
    renderGallery([image(1)], { multibuyOption: "2x1" });

    expect(screen.getByText("2x1")).toBeInTheDocument();
  });

  it("shows both pills when discount and multibuy coexist", () => {
    renderGallery([image(1)], { discountPercentage: 10, multibuyOption: "3x2" });

    expect(screen.getAllByTestId("product-badge")).toHaveLength(2);
  });

  it("shows no badge without a promotion", () => {
    renderGallery([image(1)], { multibuyOption: "" });

    expect(screen.queryByTestId("product-badge")).not.toBeInTheDocument();
  });
});

describe("ProductDetailGallery sticky behavior", () => {
  it("is sticky only from md up, offset by the given top", () => {
    renderGallery([image(1), image(2)], {}, { stickyTop: 79 });
    const rules = rulesFor(screen.getByTestId("product-detail-gallery"));
    const stickyRules = rules.filter((r) => /sticky/.test(r));

    // md+: the only sticky rule, scoped to min-width 900px with the offset.
    expect(stickyRules).toHaveLength(1);
    expect(stickyRules[0]).toMatch(/min-width:\s*900px/);
    expect(stickyRules[0]).toMatch(/top:\s*79px/);
    // xs/sm: static flow, no top offset leaking outside the md+ query.
    expect(rules.some((r) => /min-width:\s*0px[^}]*position:\s*static/.test(r))).toBe(
      true,
    );
    expect(rules.filter((r) => !/min-width:\s*900px/.test(r)).join("")).not.toMatch(
      /top:/,
    );
  });
});

// Viewport + tipo de puntero: `fine` = escritorio con mouse.
const mockViewport = ({ mobile, finePointer }: { mobile: boolean; finePointer: boolean }) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches:
      (mobile && query.includes("max-width")) ||
      (finePointer && query.includes("pointer: fine")),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const model3d = (extra: Record<string, unknown> = {}) => ({
  model3d: { id: 5, glbFile: "https://cdn.test/pizza.glb", usdzFile: null, ...extra },
});

const viewerEl = () =>
  screen.queryByTestId("model-viewer-element") as
    | (HTMLElement & { canActivateAR?: boolean })
    | null;

const loadViewer = (canAR: boolean) => {
  const el = viewerEl()!;
  el.canActivateAR = canAR;
  act(() => {
    el.dispatchEvent(new Event("load"));
  });
};

describe("ProductDetailGallery 3D model", () => {
  it("renders no 3D item and no viewer without a model", () => {
    renderGallery([image(1), image(2)]);

    expect(screen.queryByRole("button", { name: "Ver modelo 3D" })).not.toBeInTheDocument();
    expect(viewerEl()).toBeNull();
    expect(screen.getByAltText("Pizza")).toBeInTheDocument();
  });

  it("ignores a model marked for deletion", () => {
    renderGallery([image(1)], model3d({ _delete: true }));

    expect(screen.queryByRole("button", { name: "Ver modelo 3D" })).not.toBeInTheDocument();
  });

  it("adds the 3D thumbnail last and mounts the viewer only once it is selected", () => {
    renderGallery([image(1), image(2)], model3d());
    const thumb = screen.getByRole("button", { name: "Ver modelo 3D" });

    // El ítem 3D va después de todos los medios.
    expect(
      screen.getByAltText("thumb-2").compareDocumentPosition(thumb) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(viewerEl()).toBeNull();

    fireEvent.click(thumb);
    expect(viewerEl()).toHaveAttribute("src", "https://cdn.test/pizza.glb");
    expect(viewerEl()).toHaveAttribute("alt", "Modelo 3D de Pizza");
    expect(thumb).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByAltText("Pizza")).not.toBeInTheDocument();
  });

  it("passes the USDZ as ios-src", () => {
    renderGallery([], model3d({ usdzFile: "https://cdn.test/pizza.usdz" }));

    expect(viewerEl()).toHaveAttribute("ios-src", "https://cdn.test/pizza.usdz");
  });

  it("loads the viewer right away when there is no other media", () => {
    renderGallery([], model3d());

    expect(viewerEl()).toBeInTheDocument();
  });

  it("starts on the 3D item with initialView='3d'", () => {
    renderGallery([image(1), image(2)], model3d(), { initialView: "3d" });

    expect(viewerEl()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver modelo 3D" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the rail on mobile with one image plus a model", () => {
    mockMobile(true);
    renderGallery([image(1)], model3d());

    expect(screen.getByAltText("thumb-1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver modelo 3D" })).toBeInTheDocument();
  });

  it("lets gestures through the badges while 3D is selected", () => {
    renderGallery([image(1)], { discountPercentage: 20, ...model3d() });
    const badges = screen.getByTestId("gallery-badge-container");
    expect(getComputedStyle(badges).pointerEvents).not.toBe("none");

    fireEvent.click(screen.getByRole("button", { name: "Ver modelo 3D" }));
    expect(getComputedStyle(screen.getByTestId("gallery-badge-container")).pointerEvents).toBe(
      "none",
    );
  });

  describe("QR handoff", () => {
    const publicUrl = "https://marky.test/mi-negocio/pizzas/pizza";
    // CRA usa resetMocks: la implementación se define en cada test.
    beforeEach(() => {
      (QRCode.toDataURL as unknown as jest.Mock).mockResolvedValue(
        "data:image/png;base64,QR",
      );
    });

    it("shows 'Ver en tu celular' on desktop without AR and opens the QR for ?view=3d", async () => {
      mockViewport({ mobile: false, finePointer: true });
      renderGallery([], model3d(), { publicUrl });
      expect(screen.queryByRole("button", { name: "Ver en tu celular" })).not.toBeInTheDocument();

      loadViewer(false);
      fireEvent.click(screen.getByRole("button", { name: "Ver en tu celular" }));

      expect(
        await screen.findByText("Escanea con tu celular para ver el producto en tu espacio."),
      ).toBeInTheDocument();
      expect(await screen.findByAltText("Código QR del producto")).toBeInTheDocument();
      expect(QRCode.toDataURL).toHaveBeenCalledWith(`${publicUrl}?view=3d&mk_source=qr`, expect.anything());
    });

    it("hides it when AR is available", () => {
      mockViewport({ mobile: false, finePointer: true });
      renderGallery([], model3d(), { publicUrl });
      loadViewer(true);

      expect(screen.queryByRole("button", { name: "Ver en tu celular" })).not.toBeInTheDocument();
    });

    it("hides it on touch devices", () => {
      mockViewport({ mobile: true, finePointer: false });
      renderGallery([], model3d(), { publicUrl });
      loadViewer(false);

      expect(screen.queryByRole("button", { name: "Ver en tu celular" })).not.toBeInTheDocument();
    });

    it("hides it without a publicUrl", () => {
      mockViewport({ mobile: false, finePointer: true });
      renderGallery([], model3d());
      loadViewer(false);

      expect(screen.queryByRole("button", { name: "Ver en tu celular" })).not.toBeInTheDocument();
    });

    it("hides it when an image is selected", () => {
      mockViewport({ mobile: false, finePointer: true });
      renderGallery([image(1)], model3d(), { publicUrl, initialView: "3d" });
      loadViewer(false);
      expect(screen.getByRole("button", { name: "Ver en tu celular" })).toBeInTheDocument();

      fireEvent.click(screen.getByAltText("thumb-1"));
      expect(screen.queryByRole("button", { name: "Ver en tu celular" })).not.toBeInTheDocument();
    });
  });
});
