import { act, render } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../themes/light";
import { PublicProductDetailView } from "./PublicProductDetailPage";
import { sentEvents, setupAnalyticsEnv } from "../../analytics/testUtils";

jest.mock("../../hooks/usePublicBusinessProfile", () => ({
  __esModule: true,
  default: () => ({ data: { business_name: "Mi Negocio" } }),
}));
jest.mock("../../hooks/usePublicProductBySlug", () => ({
  __esModule: true,
  default: () => ({}),
}));
jest.mock("../product/components/ProductDetailContent", () => ({
  __esModule: true,
  PRODUCT_PAGE_MAX_WIDTH: 1440,
  default: () => <div data-testid="content" />,
}));

let fetchMock: jest.Mock;
const product: any = { id: 9, name: "Pizza" };

const renderView = (props: any) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <PublicProductDetailView businessId="mi-negocio" isLoading={false} error={null} {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );
const tick = (ms: number) => act(() => void jest.advanceTimersByTime(ms));
const types = () => sentEvents(fetchMock).map((e: any) => e.type);

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = setupAnalyticsEnv();
  window.scrollTo = jest.fn();
});
afterEach(() => jest.useRealTimers());

describe("PublicProductDetailView analytics", () => {
  it("deep link without visiting the catalog emits exactly one catalog_visit, plus the open", () => {
    window.history.replaceState(null, "", "/mi-negocio/pizzas/pizza?mk_source=qr");
    renderView({ product });
    tick(1500);
    expect(types().filter((t) => t === "catalog_visit")).toHaveLength(1);
    expect(types()).toContain("product_open");
    expect(sentEvents(fetchMock).every((e: any) => e.source === "qr")).toBe(true);
  });

  it("emits a view after 3 visible seconds, and nothing while loading or on error", () => {
    renderView({ product: undefined, isLoading: true });
    renderView({ product: undefined, error: { response: { status: 404 } } });
    tick(10_000);
    expect(fetchMock).not.toHaveBeenCalled();

    renderView({ product });
    tick(3000);
    tick(1500);
    expect(types()).toContain("product_view");
  });

  it("never sends from the private ProductDetailPage (no analytics import)", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    const read = (p: string) => fs.readFileSync(`${process.cwd()}/src/${p}`, "utf8");
    [
      "pages/product/ProductDetailPage.tsx",
      "pages/product/components/ProductDetailContent.tsx",
      "components/BusinessProfilePanel.tsx",
      "pages/home/components/SocialMediaInfo.tsx",
    ].forEach((file) => {
      expect(read(file)).not.toMatch(/analytics\/(client|hooks)/);
    });
  });
});
