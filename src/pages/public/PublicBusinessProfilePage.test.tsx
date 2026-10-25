import { fireEvent, render, screen, within } from "@testing-library/react";
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

jest.mock("../../utils/utils", () => ({ ShowNotification: jest.fn() }));

const renderPage = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={["/mi-negocio"]}>
        <Routes>
          <Route path="/:businessId" element={<PublicBusinessProfilePage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

const cssRulesFor = (element: HTMLElement) =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .map((rule) => rule.cssText)
    .filter((text) =>
      element.className
        .split(" ")
        .some((cls) => cls && text.includes(`.${cls}`)),
    )
    .join("\n");

describe("PublicBusinessProfilePage", () => {
  it("is read-only and never touches authenticated notification data", () => {
    renderPage();

    expect(screen.queryByLabelText("Editar perfil")).not.toBeInTheDocument();
    expect(useNotifications).not.toHaveBeenCalled();
  });

  it("has no mobile top bar, and the only overflow menu is beside the theme toggle", () => {
    renderPage();

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    const menus = screen.getAllByRole("button", { name: "Más acciones" });
    expect(menus).toHaveLength(1);
    expect(screen.getByTestId("profile-top-actions")).toContainElement(menus[0]);
  });

  it("renders the theme toggle inside the sticky profile box", () => {
    renderPage();

    const stickyBox = screen.getByTestId("profile-sticky-box");
    expect(stickyBox).toContainElement(
      screen.getByRole("button", { name: /^Modo (oscuro|claro)$/ }),
    );
    expect(stickyBox).toContainElement(screen.getByText("Mi Negocio"));
  });

  it("places the three-dot menu beside the theme toggle, with all share actions", () => {
    renderPage();

    const actions = screen.getByTestId("profile-top-actions");
    expect(
      within(actions).getByRole("button", { name: /^Modo (oscuro|claro)$/ }),
    ).toBeInTheDocument();
    fireEvent.click(within(actions).getByRole("button", { name: "Más acciones" }));
    expect(screen.getAllByRole("menuitem").map((i) => i.textContent)).toEqual([
      "Compartir perfil",
      "Copiar URL del perfil",
      "Descargar código QR",
      "Reportar",
    ]);
  });

  it("does not pin the desktop layout to a fixed 100vh height", () => {
    renderPage();

    const layout = screen.getByTestId("public-profile-layout");
    const rules = cssRulesFor(layout);

    // `height: 100vh` clipped the sticky rail to the first viewport; the
    // layout must grow (min-height) with the catalog instead.
    expect(rules).not.toMatch(/(^|[^-])height:\s*100vh/);
    expect(rules).toMatch(/min-height:\s*100vh/);
  });

  it("moves the desktop top spacing from the page wrapper into both columns", () => {
    renderPage();

    const pageRules = cssRulesFor(screen.getByTestId("public-profile-page"));
    const profileRules = cssRulesFor(screen.getByTestId("public-profile-column"));
    const catalogRules = cssRulesFor(screen.getByTestId("public-catalog-column"));

    // spacing: 4 => sx value 8 is 32 px. Mobile keeps that page spacing,
    // while md+ removes it so the divider reaches the top edge.
    expect(pageRules).toMatch(/padding-top:\s*32px/);
    expect(pageRules).toMatch(
      /@media \(min-width:\s*900px\)[\s\S]*padding-top:\s*0px/,
    );
    expect(profileRules).toMatch(
      /@media \(min-width:\s*900px\)[\s\S]*padding-top:\s*32px/,
    );
    expect(catalogRules).toMatch(
      /@media \(min-width:\s*900px\)[\s\S]*padding-top:\s*32px/,
    );
  });
});
