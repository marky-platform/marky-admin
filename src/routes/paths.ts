export const ROUTES = {
  // HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email/",
  RECOVER_PASSWORD: "/recover-password",
  NEW_PASSWORD: "/reset-password/:uid/:token",
  // protected routes
  CONFIGURATION: "/configuration",
  ACCOUNT_CONFIGURATION: "/account/configuration",
  HOME: "/home",
  PRODUCT_DETAIL: "/product/:id",
  PRODUCT_EDIT: "/product/edit/:id",
  PRODUCT_CREATE: "/product/create",
  // public (unauthenticated) routes — catch-alls, must be registered last (see App.tsx)
  PUBLIC_BUSINESS: "/:businessId",
  // Ruta legada con id numérico: redirige a la canónica.
  PUBLIC_PRODUCT_DETAIL: "/:businessId/product/:id",
  PUBLIC_PRODUCT_CANONICAL: "/:businessId/:categorySlug/:productSlug",
};
