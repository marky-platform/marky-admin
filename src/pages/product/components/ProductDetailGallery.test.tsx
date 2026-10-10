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

const renderGallery = (media: any[]) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ProductDetailGallery
        product={{ id: 1, name: "Pizza", price: "10", media } as unknown as Product}
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
