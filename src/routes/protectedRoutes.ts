import { lazy } from "react";
import { ROUTES } from "./paths";

// Carga por ruta (React.lazy): cada pantalla va en su propio chunk.
const AccountConfigurationPage = lazy(() => import("../pages/account/AccountConfigurationPage"));
const Configuration = lazy(() => import("../pages/Configuration"));
const Home = lazy(() => import("../pages/home"));
const ProductDetailPage = lazy(() => import("../pages/product/ProductDetailPage"));
const ProductFormPage = lazy(() => import("../pages/product/ProductFormPage"));
const Logout = lazy(() => import("../pages/Logout"));

export const protectedRoutes = [
  { path: ROUTES.LOGOUT, component: Logout },
  { path: ROUTES.CONFIGURATION, component: Configuration },
  {
    path: ROUTES.ACCOUNT_CONFIGURATION,
    component: AccountConfigurationPage,
  },
  { path: ROUTES.HOME, component: Home },
  { path: ROUTES.PRODUCT_DETAIL, component: ProductDetailPage },
  { path: ROUTES.PRODUCT_EDIT, component: ProductFormPage },
  { path: ROUTES.PRODUCT_CREATE, component: ProductFormPage },
];
