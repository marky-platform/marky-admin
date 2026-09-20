import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
//import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";
import PublicBusinessProfilePage from "./pages/public/PublicBusinessProfilePage";
import PublicProductDetailPage from "./pages/public/PublicProductDetailPage";
import { publicRoutes } from "./routes/publicRoutes";
import { CustomThemeProvider } from "./themes/ThemeContext";
import { protectedRoutes } from "./routes/protectedRoutes";
import { useSessionStore } from "./stores/sessionStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { ROUTES } from "./routes/paths";
import { CssBaseline } from "@mui/material";
import { LoadingProvider } from "./contexts/LoadingContext";
import AppErrorBoundary from "./components/AppErrorBoundary";

const App = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated());
  const { user } = useSessionStore();

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CustomThemeProvider>
          <LoadingProvider>
            <CssBaseline />
            <BrowserRouter>
              <Routes>
                {/* Loop over public routes */}
                {publicRoutes.map(({ path, component: Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      isAuthenticated ? (
                        !user?.has_configuration &&
                        path !== ROUTES.CONFIGURATION ? (
                          <Navigate to={`${ROUTES.CONFIGURATION}`} />
                        ) : (
                          <Navigate to="/home" />
                        )
                      ) : (
                        <Component />
                      )
                    }
                  />
                ))}

                {/* Loop over private routes */}

                {protectedRoutes.map(({ path, component: Component }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      isAuthenticated ? (
                        !user?.has_configuration &&
                        path !== ROUTES.CONFIGURATION &&
                        path !== ROUTES.LOGOUT ? (
                          <Navigate to={`${ROUTES.CONFIGURATION}`} />
                        ) : user?.has_configuration &&
                          path === ROUTES.CONFIGURATION ? (
                          <Navigate to="/home" />
                        ) : (
                          <Component />
                        )
                      ) : (
                        <Navigate to="/login" />
                      )
                    }
                  />
                ))}

                {/* Public (unauthenticated) business/product pages. These are
                    catch-all `/:businessId` routes, so they're registered
                    outside both `.map()` loops above (which apply auth
                    redirects) and must render unconditionally in every auth
                    state — a logged-in merchant must still be able to view a
                    public page instead of being bounced to /home. React
                    Router ranks static segments (e.g. /login) above dynamic
                    ones regardless of order, but keeping this last guards
                    future routes. */}
                <Route
                  path={ROUTES.PUBLIC_PRODUCT_DETAIL}
                  element={<PublicProductDetailPage />}
                />
                <Route
                  path={ROUTES.PUBLIC_BUSINESS}
                  element={<PublicBusinessProfilePage />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ToastContainer />
            </BrowserRouter>
          </LoadingProvider>
        </CustomThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
