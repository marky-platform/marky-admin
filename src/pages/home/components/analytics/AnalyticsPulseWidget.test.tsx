import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../../../themes/light";
import AnalyticsPulseWidget from "./AnalyticsPulseWidget";
import { emptyPulseFixture, pulseFixture } from "./analyticsFixtures";
import { getAnalyticsPulse } from "../../../../services/analyticsService";
import {
  actionsInsight,
  barRatio,
  deltaPercent,
  formatDelta,
  formatPeriodRange,
  formatSeconds,
  formatTimeAgo,
  weekdayInitial,
} from "./format";
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
  it("shows today, the 7-day sparkline and the delta on the closed rail", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    const btn = screen.getByRole("button", { name: "Abrir analíticas" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls");
    expect(within(btn).getByText("Pulso")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("rail-today")).toHaveTextContent("14"));
    expect(screen.getByText("HOY")).toBeInTheDocument();
    expect(screen.getAllByTestId("rail-bar")).toHaveLength(7);
    // 44 visitas vs. 49 de los 7 días anteriores
    expect(screen.getByText("−10%")).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(7, "views");
  });

  it("opens with the full panel and closes with Escape", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    expect(await screen.findByText("14 visitas hoy")).toBeInTheDocument();
    expect(screen.getByText("Actividad de tu catálogo")).toBeInTheDocument();
    expect(screen.getByText("Actualizado 10:10")).toBeInTheDocument();
    expect(screen.getByText("17–23 de octubre")).toBeInTheDocument();
    expect(screen.getByText("Visitas al catálogo")).toBeInTheDocument();
    expect(screen.getByText("44")).toBeInTheDocument();
    expect(screen.getByText("−10 %")).toBeInTheDocument();
    expect(screen.getAllByText("vs. 7 días anteriores")).toHaveLength(2);
    expect(screen.getAllByTestId("visits-bar")).toHaveLength(7);
    expect(screen.getByText("Link público")).toBeInTheDocument();
    expect(screen.getByText("Código QR")).toBeInTheDocument();
    // 18 acciones vs. 12: sube aunque bajen las visitas
    expect(screen.getByText("+50 %")).toBeInTheDocument();
    expect(screen.getByText("Más clics, aunque hubo menos visitas.")).toBeInTheDocument();
    expect(screen.getByText("Otros enlaces")).toBeInTheDocument();

    const close = screen.getByRole("button", { name: "Cerrar analíticas" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Abrir analíticas" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("refetches with the chosen period and product sort", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    await screen.findByText("14 visitas hoy");
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Período" }));
    fireEvent.click(await screen.findByRole("option", { name: "30 días" }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(30, "views"));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Ordenar productos" }));
    fireEvent.click(await screen.findByRole("option", { name: "Más tiempo" }));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(30, "time"));
    expect(await screen.findByText("Ordenados por tiempo promedio")).toBeInTheDocument();
  });

  it("moves focus to the close button on open and back to the rail on close", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    const close = screen.getByRole("button", { name: "Cerrar analíticas" });
    expect(close).toHaveFocus();
    fireEvent.click(close);
    const rail = screen.getByRole("button", { name: "Abrir analíticas" });
    expect(rail).toHaveFocus();

    openWidget();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Abrir analíticas" }),
    ).toHaveFocus();
  });

  it("does not close on Escape handled by a dialog or already prevented", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    const expanded = () =>
      screen.getByRole("button", { name: "Cerrar analíticas" }).getAttribute(
        "aria-expanded",
      );

    const prevented = new KeyboardEvent("keydown", {
      key: "Escape",
      cancelable: true,
      bubbles: true,
    });
    prevented.preventDefault();
    document.dispatchEvent(prevented);
    expect(expanded()).toBe("true");

    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    document.body.appendChild(dialog);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(expanded()).toBe("true");
    dialog.remove();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: "Abrir analíticas" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("ranks products with thumbnail, time and views; deleted ones without link", async () => {
    mockGet.mockResolvedValue(pulseFixture);
    renderWidget();
    openWidget();
    expect(
      await screen.findByRole("link", { name: /Pizza Margarita/ }),
    ).toHaveAttribute("href", "/product/123");
    expect(screen.getByText("Sushi viejo")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Sushi viejo/ })).toBeNull();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("18 s de tiempo promedio")).toBeInTheDocument();
    expect(screen.getByText("1 min 15 s de tiempo promedio")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    const rows = screen.getAllByRole("listitem").filter((li) => within(li).queryByText(/de tiempo promedio/));
    expect(within(rows[0]).getByTestId("product-thumb")).toHaveAttribute("src", "https://cdn.test/pizza.jpg");
    // sin imagen: inicial del nombre
    expect(within(rows[1]).getByText("S")).toBeInTheDocument();
  });

  it("shows error with retry that refetches", async () => {
    mockGet.mockRejectedValue(new Error("boom"));
    renderWidget();
    openWidget();
    const retry = await screen.findByRole(
      "button",
      { name: "Reintentar" },
      { timeout: 3000 },
    );
    mockGet.mockResolvedValue(pulseFixture);
    fireEvent.click(retry);
    expect(await screen.findByText("14 visitas hoy")).toBeInTheDocument();
    // el panel sigue pudiendo cerrarse
    expect(
      screen.getByRole("button", { name: "Cerrar analíticas" }),
    ).toBeInTheDocument();
  });

  it("shows the empty state with zero values and no deltas", async () => {
    mockGet.mockResolvedValue(emptyPulseFixture);
    renderWidget();
    openWidget();
    expect(
      await screen.findByText("Todavía no hay actividad en tu perfil"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sin visitas todavía")).toBeInTheDocument();
    expect(screen.queryByText(/días anteriores/)).toBeNull();
    screen.getAllByTestId("visits-bar").forEach((bar) => {
      expect(getComputedStyle(bar).height).toBe("2px");
    });
  });

  it("tolerates partial data", async () => {
    mockGet.mockResolvedValue({ today: { visits: 3 } });
    renderWidget();
    openWidget();
    expect(await screen.findByText("3 visitas hoy")).toBeInTheDocument();
    expect(screen.getByText("Todavía no hay productos vistos.")).toBeInTheDocument();
  });
});

describe("analytics helpers", () => {
  it("formats seconds", () => {
    expect(formatSeconds(0)).toBe("0 s");
    expect(formatSeconds(42)).toBe("42 s");
    expect(formatSeconds(75)).toBe("1 min 15 s");
    expect(formatSeconds(120)).toBe("2 min");
  });
  it("computes and formats deltas", () => {
    expect(deltaPercent(44, 49)).toBe(-10);
    expect(deltaPercent(5, 0)).toBeNull();
    expect(formatDelta(-10)).toBe("−10 %");
    expect(formatDelta(25, true)).toBe("+25%");
    expect(formatDelta(0)).toBe("0 %");
  });
  it("formats the period range", () => {
    expect(formatPeriodRange("2026-09-18", "2026-09-24")).toBe("18–24 de septiembre");
    expect(formatPeriodRange("2026-09-28", "2026-10-04")).toBe(
      "28 de septiembre – 4 de octubre",
    );
  });
  it("formats time ago", () => {
    const now = new Date("2026-10-23T13:20:00Z");
    expect(formatTimeAgo("2026-10-23T13:08:00Z", now)).toBe("hace 12 min");
    expect(formatTimeAgo("2026-10-23T13:19:50Z", now)).toBe("hace un momento");
  });
  it("picks the insight from both trends", () => {
    expect(actionsInsight(-10, 25)).toBe("Más clics, aunque hubo menos visitas.");
    expect(actionsInsight(null, 25)).toBeNull();
  });
  it("uses Figma weekday initials", () => {
    expect(weekdayInitial("2026-10-21")).toBe("M"); // miércoles
    expect(weekdayInitial("2026-10-24")).toBe("S");
  });
  it("bar ratio is zero-safe", () => {
    expect(barRatio(0, 0)).toBe(0);
    expect(barRatio(5, 10)).toBe(0.5);
  });
  it("maps snake_case to camelCase", () => {
    const m = mapAnalyticsPulse(pulseFixture);
    expect(m.today.uniqueVisitors).toBe(11);
    expect(m.sources.publicLink).toBe(18);
    expect(m.previous).toEqual({ visits: 49, actions: 12 });
    expect(m.period).toEqual({ start: "2026-10-17", end: "2026-10-23" });
    expect(m.topProducts[0].image).toBe("https://cdn.test/pizza.jpg");
    expect(m.topProducts[1].productId).toBeNull();
  });
});
