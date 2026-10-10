import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import lightTheme from "../../themes/light";
import PublicBusinessProfilePage from "./PublicBusinessProfilePage";
import useNotifications from "../../hooks/useNotifications";

jest.mock("../../hooks/usePublicBusinessProfile", () => ({
  __esModule: true,
  default: () => ({
    data: {
      business_name: "Mi Negocio",
      profile_image: "",
      description: "",
      categories: [],
      social_links: [],
      locations: [],
      headquarter_attributes: [],
    },
    isLoading: false,
    error: null,
  }),
}));
jest.mock("../../hooks/usePublicCategories", () => ({
  __esModule: true,
  default: () => ({ data: { results: [] } }),
}));
jest.mock("../../hooks/useNotifications", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("./components/PublicProductGrid", () => ({
  __esModule: true,
  default: () => <div />,
}));

describe("PublicBusinessProfilePage mobile top bar", () => {
  it("is read-only and never touches authenticated notification data", () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter initialEntries={["/mi-negocio"]}>
          <Routes>
            <Route path="/:businessId" element={<PublicBusinessProfilePage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Más acciones" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Editar perfil")).not.toBeInTheDocument();
    expect(useNotifications).not.toHaveBeenCalled();
  });
});
