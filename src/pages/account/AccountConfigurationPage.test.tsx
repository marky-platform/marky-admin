import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../themes/light";
import { cssForSelector } from "../../components/cssTestUtils";
import AccountConfigurationPage from "./AccountConfigurationPage";

jest.mock("../../components/Header", () => ({ Header: () => null }));
jest.mock("../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({ data: undefined, isLoading: false }),
}));
jest.mock("../../hooks/useBusinessMutations", () => ({
  useUpdateBusinessAccountInfo: () => ({ mutateAsync: jest.fn() }),
}));
jest.mock("../../hooks/useHomePageData", () => ({
  useHomePageData: () => ({ data: undefined }),
}));
jest.mock("../../hooks/useCategories", () => ({
  useCategories: () => ({ categories: [] }),
}));
jest.mock("../../hooks/useCities", () => ({
  useCities: () => ({ cities: [] }),
}));
jest.mock("../../hooks/useCountries", () => ({
  useCountries: () => ({ countries: [] }),
}));
jest.mock("../../hooks/useCurrencies", () => ({
  useCurrencies: () => ({ currencies: [] }),
}));

// JSDOM no evalúa media queries: se inspeccionan las reglas @media que emotion
// inyectó. Breakpoints del tema: xs = 0px, sm = 600px.
const mediaWidth = (css: string, minWidth: number) =>
  css.match(
    new RegExp(`@media \\(min-width:${minWidth}px\\) \\{[^{]*\\{width: ([^;]+);`),
  )?.[1];

const renderPage = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <AccountConfigurationPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

const expectResponsiveWidth = (desktopWidth: number) => {
  const css = cssForSelector("[tabindex='-1']");
  // xs: ancho seguro para teléfonos
  expect(mediaWidth(css, 0)).toBe("calc(100vw - 32px)");
  // sm+: el ancho de escritorio no cambia
  expect(mediaWidth(css, 600)).toBe(`${desktopWidth}px`);
};

describe("AccountConfigurationPage modals", () => {
  const configCases: [string, number, number][] = [
    ["categorías comerciales", 0, 720],
    ["ubicación", 1, 520],
    ["tipo de negocio", 2, 520],
    ["expresión monetaria", 3, 720],
  ];

  it.each(configCases)(
    "the %s modal fits phones and keeps its desktop width",
    (_name, index, desktopWidth) => {
      renderPage();
      fireEvent.click(screen.getAllByTestId("EditOutlinedIcon")[index]);

      expectResponsiveWidth(desktopWidth);
    },
  );

  it("the access modal fits phones and keeps its 520px desktop width", () => {
    renderPage();
    fireEvent.click(screen.getByText("Seguridad"));
    fireEvent.click(screen.getByTestId("EditOutlinedIcon"));

    expectResponsiveWidth(520);
  });
});
