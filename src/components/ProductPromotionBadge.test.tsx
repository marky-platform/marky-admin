import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../themes/light";
import ProductPromotionBadge from "./ProductPromotionBadge";

const renderBadge = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);

describe("ProductPromotionBadge", () => {
  it("renders an integer discount without decimals", () => {
    renderBadge(<ProductPromotionBadge kind="discount" value={15} />);
    expect(screen.getByText("-15%")).toBeInTheDocument();
  });

  it("trims trailing zeros of a fractional discount", () => {
    renderBadge(<ProductPromotionBadge kind="discount" value={12.5} />);
    expect(screen.getByText("-12.5%")).toBeInTheDocument();
  });

  it("renders the multibuy label as-is", () => {
    renderBadge(<ProductPromotionBadge kind="multibuy" value="2x1" />);
    expect(screen.getByText("2x1")).toBeInTheDocument();
  });

  it("uses the pill shape with error color for discounts and primary for multibuy", () => {
    const { unmount } = renderBadge(
      <ProductPromotionBadge kind="discount" value={10} />,
    );
    let badge = screen.getByTestId("product-badge");
    expect(getComputedStyle(badge).borderRadius).toBe("24px");
    const discountBg = getComputedStyle(badge).backgroundColor;
    unmount();

    renderBadge(<ProductPromotionBadge kind="multibuy" value="3x2" />);
    badge = screen.getByTestId("product-badge");
    expect(getComputedStyle(badge).borderRadius).toBe("24px");
    expect(getComputedStyle(badge).backgroundColor).not.toBe(discountBg);
  });
});
