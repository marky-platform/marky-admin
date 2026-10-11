import { render, screen } from "@testing-library/react";
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
