import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import lightTheme from "../themes/light";
import ProductListItem from "./ProductListItem";
import { cssFor, cssForParent } from "./cssTestUtils";

jest.mock("./ProductActionsMenu", () => ({
  __esModule: true,
  default: () => null,
}));

const product = {
  id: 1,
  name: "Pizza",
  price: "10",
  discountPercent: 30,
  multibuyOption: "2x1",
  image: "pizza.jpg",
};

const renderItem = (p: any = product) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={lightTheme}>
        <ProductListItem product={p} readOnly />
      </ThemeProvider>
    </QueryClientProvider>,
  );

describe("ProductListItem accesibilidad de teclado", () => {
  const renderWith = (readOnly: boolean, onClick = jest.fn()) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ThemeProvider theme={lightTheme}>
          <ProductListItem product={product as any} readOnly={readOnly} onClick={onClick} />
        </ThemeProvider>
      </QueryClientProvider>,
    );

  it("readOnly + onClick: enlace enfocable activable con Enter", () => {
    const onClick = jest.fn();
    renderWith(true, onClick);
    const item = screen.getByTestId("product-list-item");
    expect(item).toHaveAttribute("role", "link");
    expect(item).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(item, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("modo admin: sin role/tabIndex (contiene el menú de acciones)", () => {
    renderWith(false);
    const item = screen.getByTestId("product-list-item");
    expect(item).not.toHaveAttribute("role");
    expect(item).not.toHaveAttribute("tabindex");
  });
});

describe("ProductListItem sizing", () => {
  it("image container is 70px on mobile and 90px on desktop", () => {
    renderItem();
    const css = cssForParent(screen.getByRole("img", { name: "Pizza" }));
    expect(css).toMatch(/width: 70px/);
    expect(css).toMatch(/min-width:\s*900px[^}]*\{[^}]*width: 90px/s);
    expect(css).toMatch(/min-width:\s*900px[^}]*\{[^}]*height: 90px/s);
    expect(css).not.toMatch(/width: 64px/);
  });

  it("desktop promotion pills are 28px tall with 14px text; mobile stays 12px", () => {
    renderItem();
    const pill = screen.getAllByText("-30%").find((el) => el.tagName === "DIV" &&
      cssFor(el).includes("display: none"))!;
    const css = cssFor(pill);
    expect(css).toMatch(/font-size: 12px/);
    expect(css).toMatch(/min-width:\s*900px[^}]*\{[^}]*font-size: 14px/s);
    expect(css).toMatch(/min-width:\s*900px[^}]*\{[^}]*line-height: 28px/s);
  });
});

describe("ProductListItem image source (F-24)", () => {
  it("uses the thumbnail when available, else the original", () => {
    const { unmount } = renderItem({ ...product, imageThumbnail: "thumb.webp" });
    expect(screen.getByAltText("Pizza")).toHaveAttribute("src", "thumb.webp");
    unmount();
    renderItem(product);
    expect(screen.getByAltText("Pizza")).toHaveAttribute("src", "pizza.jpg");
  });
});
