import { lazy } from "react";
import { ROUTES } from "./paths";

// Carga por ruta (React.lazy): cada pantalla va en su propio chunk.
const EmailVerification = lazy(() => import("../pages/EmailVerification"));
const Login = lazy(() => import("../pages/Login"));
const NewPassword = lazy(() => import("../pages/NewPassword"));
const RecoverPassword = lazy(() => import("../pages/RecoverPassword"));
const Register = lazy(() => import("../pages/Register"));

export const publicRoutes = [
  { path: ROUTES.LOGIN, component: Login },
  { path: "/", component: Login },
  { path: ROUTES.REGISTER, component: Register },
  { path: ROUTES.VERIFY_EMAIL, component: EmailVerification },
  { path: ROUTES.RECOVER_PASSWORD, component: RecoverPassword },
  { path: ROUTES.NEW_PASSWORD, component: NewPassword },
];
