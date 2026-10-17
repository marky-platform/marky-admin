import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import ProductDetailGallery from "./ProductDetailGallery";
import { Product } from "../../../types/product";

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
  props: { stickyTop?: number } = {},
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
