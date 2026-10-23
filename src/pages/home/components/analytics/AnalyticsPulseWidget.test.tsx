import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../../../themes/light";
import AnalyticsPulseWidget from "./AnalyticsPulseWidget";
import { emptyPulseFixture, pulseFixture } from "./analyticsFixtures";
import { getAnalyticsPulse } from "../../../../services/analyticsService";
import { formatDuration, barRatio } from "./format";
import { mapAnalyticsPulse } from "../../../../mappers/analyticsMapper";

jest.mock("../../../../services/analyticsService", () => ({
  getAnalyticsPulse: jest.fn(),
}));
const mockGet = getAnalyticsPulse as jest.Mock;

const renderWidget = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <AnalyticsPulseWidget />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
};

const openWidget = () =>
  fireEvent.click(screen.getByRole("button", { name: "Abrir analíticas" }));

beforeEach(() => mockGet.mockReset());

describe("AnalyticsPulseWidget", () => {
  it("starts closed without fetching, with accessible toggle", () => {
    renderWidget();
    const btn = screen.getByRole("button", { name: "Abrir analíticas" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls");
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("opens, shows skeleton then data, and closes with Escape", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    expect(screen.getByTestId("analytics-skeleton")).toBeInTheDocument();
    expect(await screen.findByText("Visitas de hoy")).toBeInTheDocument();
    expect(screen.getAllByText("14").length).toBeGreaterThan(0);
    expect(screen.getByText(/11 visitantes únicos/)).toBeInTheDocument();
    expect(screen.getByText("QR")).toBeInTheDocument();
    expect(screen.getByText("WhatsApp")).toBeInTheDocument();
    expect(screen.getAllByTestId("visits-bar")).toHaveLength(7);
    expect(mockGet).toHaveBeenCalledWith(7);

    const close = screen.getByRole("button", { name: "Cerrar analíticas" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Abrir analíticas" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("renders deleted products without a link and live ones with a link", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    const live = await screen.findByText("Pizza Margarita");
    expect(live.closest("a")).toHaveAttribute("href", "/product/123");
    expect(screen.getByText("Sushi viejo").closest("a")).toBeNull();
    expect(screen.getByText(/12 vistas · 18s/)).toBeInTheDocument();
    expect(screen.getByText(/3 vistas · 1m 15s/)).toBeInTheDocument();
  });

  it("shows error with retry that refetches", async () => {
    mockGet.mockRejectedValueOnce(new Error("boom"));
    mockGet.mockRejectedValueOnce(new Error("boom"));
    mockGet.mockResolvedValueOnce(pulseFixture);
    renderWidget();
    openWidget();
    const retry = await screen.findByRole(
      "button",
      { name: "Reintentar" },
      { timeout: 3000 },
    );
    fireEvent.click(retry);
    expect(await screen.findByText("Visitas de hoy")).toBeInTheDocument();
    // el riel sigue pudiendo cerrarse
    expect(
      screen.getByRole("button", { name: "Cerrar analíticas" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state with zero values", async () => {
    mockGet.mockResolvedValue(emptyPulseFixture);
    renderWidget();
    openWidget();
    expect(
      await screen.findByText("Todavía no hay actividad en tu perfil"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sin visitas todavía")).toBeInTheDocument();
    screen.getAllByTestId("visits-bar").forEach((bar) => {
      expect(getComputedStyle(bar).height).toBe("2px");
    });
  });

  it("tolerates partial data", async () => {
    mockGet.mockResolvedValue({ today: { visits: 3 } });
    renderWidget();
    openWidget();
    expect(await screen.findByText("Visitas de hoy")).toBeInTheDocument();
    expect(screen.getByText("Todavía no hay productos vistos.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });
});

describe("analytics helpers", () => {
  it("formats durations", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(59)).toBe("59s");
    expect(formatDuration(125)).toBe("2m 5s");
  });
  it("bar ratio is zero-safe", () => {
    expect(barRatio(0, 0)).toBe(0);
    expect(barRatio(5, 10)).toBe(0.5);
  });
  it("maps snake_case to camelCase", () => {
    const m = mapAnalyticsPulse(pulseFixture);
    expect(m.today.uniqueVisitors).toBe(11);
    expect(m.sources.publicLink).toBe(18);
    expect(m.topProducts[1].productId).toBeNull();
    expect(m.topProducts[0].averageEngagedSeconds).toBe(18);
  });
});
