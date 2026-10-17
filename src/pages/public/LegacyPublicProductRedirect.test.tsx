import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import LegacyPublicProductRedirect from "./LegacyPublicProductRedirect";
import { getPublicProduct } from "../../services/publicService";
import { ROUTES } from "../../routes/paths";

jest.mock("../../services/publicService", () => ({
  getPublicProduct: jest.fn(),
}));

// The detail view is covered elsewhere; keep this test about routing.
jest.mock("./PublicProductDetailPage", () => ({
  __esModule: true,
  PublicProductDetailView: ({ product, error }: any) => (
    <div data-testid="detail">
      {product ? `detalle:${product.name}` : error ? "error" : "cargando"}
    </div>
  ),
}));

const mockedGet = getPublicProduct as jest.Mock;

const Canonical = () => (
  <div data-testid="canonical">{useLocation().pathname}</div>
);

const setup = (entry = "/dulce-momento/product/42") => {
  const router = createMemoryRouter(
    [
      { path: ROUTES.PUBLIC_PRODUCT_DETAIL, element: <LegacyPublicProductRedirect /> },
      { path: ROUTES.PUBLIC_PRODUCT_CANONICAL, element: <Canonical /> },
    ],
    { initialEntries: [entry] },
  );
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
};

describe("LegacyPublicProductRedirect", () => {
  beforeEach(() => mockedGet.mockReset());

  it("redirects to the canonical URL replacing the legacy history entry", async () => {
    mockedGet.mockResolvedValue({
      id: 42,
      name: "Torta",
      slug: "torta",
      categorySlug: "postres",
    });
    const router = setup();

    await waitFor(() =>
      expect(screen.getByTestId("canonical")).toHaveTextContent(
        "/dulce-momento/postres/torta",
      ),
    );
    expect(mockedGet).toHaveBeenCalledWith("dulce-momento", 42);
    expect(router.state.historyAction).toBe("REPLACE");
    // Only one entry: the legacy URL is no longer in the history.
    expect(router.state.location.pathname).toBe("/dulce-momento/postres/torta");
    await router.navigate(-1).catch(() => undefined);
    expect(router.state.location.pathname).toBe("/dulce-momento/postres/torta");
  });

  it("uses sin-categoria for products without a category", async () => {
    mockedGet.mockResolvedValue({
      id: 42,
      name: "Torta",
      slug: "torta",
      categorySlug: "sin-categoria",
    });
    setup();
    await waitFor(() =>
      expect(screen.getByTestId("canonical")).toHaveTextContent(
        "/dulce-momento/sin-categoria/torta",
      ),
    );
  });

  it("renders the detail from the id fetch when the product has no slug", async () => {
    mockedGet.mockResolvedValue({ id: 42, name: "Torta", slug: null, categorySlug: null });
    const router = setup();
    await waitFor(() =>
      expect(screen.getByTestId("detail")).toHaveTextContent("detalle:Torta"),
    );
    expect(router.state.location.pathname).toBe("/dulce-momento/product/42");
  });

  it("passes a 404 on to the detail view (PublicNotFound)", async () => {
    mockedGet.mockRejectedValue({ response: { status: 404 } });
    setup();
    expect(await screen.findByText("error")).toBeInTheDocument();
  });
});
