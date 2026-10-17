import { matchRoutes } from "react-router-dom";
import { ROUTES } from "./paths";

// Mirrors the route table of App.tsx (public auth pages, protected pages and
// the catch-all public pages) using only the path constants, so the ranking
// is tested without loading every page (and axios, which is ESM-only here).
const paths = [
  ROUTES.LOGIN,
  "/",
  ROUTES.REGISTER,
  ROUTES.VERIFY_EMAIL,
  ROUTES.RECOVER_PASSWORD,
  ROUTES.NEW_PASSWORD,
  ROUTES.LOGOUT,
  ROUTES.CONFIGURATION,
  ROUTES.ACCOUNT_CONFIGURATION,
  ROUTES.HOME,
  ROUTES.PRODUCT_DETAIL,
  ROUTES.PRODUCT_EDIT,
  ROUTES.PRODUCT_CREATE,
  ROUTES.PUBLIC_PRODUCT_DETAIL,
  ROUTES.PUBLIC_PRODUCT_CANONICAL,
  ROUTES.PUBLIC_BUSINESS,
];

const matched = (pathname: string) =>
  matchRoutes(
    [...paths].map((path) => ({ path })),
    pathname,
  )?.[0].route.path;

describe("public routing precedence", () => {
  it.each([
    ["/login", ROUTES.LOGIN],
    ["/register", ROUTES.REGISTER],
    ["/home", ROUTES.HOME],
    ["/dulce-momento", ROUTES.PUBLIC_BUSINESS],
    ["/product/42", ROUTES.PRODUCT_DETAIL],
    ["/product/edit/42", ROUTES.PRODUCT_EDIT],
    ["/product/create", ROUTES.PRODUCT_CREATE],
    ["/account/configuration", ROUTES.ACCOUNT_CONFIGURATION],
    ["/reset-password/uid/token", ROUTES.NEW_PASSWORD],
    ["/dulce-momento/product/42", ROUTES.PUBLIC_PRODUCT_DETAIL],
    ["/dulce-momento/postres/torta", ROUTES.PUBLIC_PRODUCT_CANONICAL],
    ["/dulce-momento/sin-categoria/torta", ROUTES.PUBLIC_PRODUCT_CANONICAL],
  ])("%s resolves to %s", (pathname, expected) => {
    expect(matched(pathname)).toBe(expected);
  });

  it("the static `product` segment beats :categorySlug regardless of order", () => {
    const reversed = [ROUTES.PUBLIC_PRODUCT_CANONICAL, ROUTES.PUBLIC_PRODUCT_DETAIL];
    const result = matchRoutes(
      reversed.map((path) => ({ path })),
      "/dulce-momento/product/42",
    );
    expect(result?.[0].route.path).toBe(ROUTES.PUBLIC_PRODUCT_DETAIL);
  });
});
