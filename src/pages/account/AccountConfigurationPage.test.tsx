import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../themes/light";
import { cssForSelector } from "../../components/cssTestUtils";
import AccountConfigurationPage from "./AccountConfigurationPage";

jest.mock("../../components/Header", () => ({ Header: () => null }));
const mockMutateAsync = jest.fn().mockResolvedValue({});
let mockAccountInfo: Record<string, unknown> = {
  email: "negocio@test.com",
  phone_number: "+595981000111",
};
jest.mock("../../hooks/useBusinessAccountInfo", () => ({
  useBusinessAccountInfo: () => ({
    data: mockAccountInfo,
    isLoading: false,
  }),
}));
jest.mock("../../hooks/useBusinessMutations", () => ({
  useUpdateBusinessAccountInfo: () => ({ mutateAsync: mockMutateAsync }),
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

  it("the access modal shows the email as text only and never submits it", async () => {
    mockMutateAsync.mockClear();
    renderPage();
    fireEvent.click(screen.getByText("Seguridad"));
    fireEvent.click(screen.getByTestId("EditOutlinedIcon"));

    // El email no es editable: no hay input con ese valor ni etiqueta Email.
    expect(screen.queryByDisplayValue("negocio@test.com")).toBeNull();
    expect(screen.queryByRole("textbox", { name: /email/i })).toBeNull();
    // Pero se muestra como texto dentro del modal (tarjeta + modal).
    expect(screen.getAllByText("negocio@test.com").length).toBeGreaterThan(1);

    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
    const payload = mockMutateAsync.mock.calls[0][0];
    expect(payload).not.toHaveProperty("email");
    expect(payload).toHaveProperty("phone_number");
  });

  it("turning the secondary currency off sends null currency and null rate (F-10)", async () => {
    mockMutateAsync.mockClear();
    mockAccountInfo = {
      ...mockAccountInfo,
      primary_currency_id: 1,
      secondary_currency_id: 2,
      exchange_rate: "7500.00",
      is_primary_to_secondary: true,
    };
    try {
      renderPage();
      fireEvent.click(screen.getAllByTestId("EditOutlinedIcon")[3]);
      fireEvent.click(screen.getByLabelText("Precios con tasa de cambio"));
      fireEvent.click(screen.getByText("Guardar"));

      await waitFor(() => expect(mockMutateAsync).toHaveBeenCalled());
      const payload = mockMutateAsync.mock.calls[0][0];
      expect(payload.secondary_currency).toBeNull();
      expect(payload.exchange_rate).toBeNull();
    } finally {
      mockAccountInfo = {
        email: "negocio@test.com",
        phone_number: "+595981000111",
      };
    }
  });
});
