import { act, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import lightTheme from "../../themes/light";
import PublicBusinessProfilePage from "./PublicBusinessProfilePage";
import BusinessProfilePanel from "../../components/BusinessProfilePanel";
import { useSessionStore } from "../../stores/sessionStore";
import {
  sentEvents,
  setupAnalyticsEnv,
} from "../../analytics/testUtils";

const mockProfileState: { value: any } = { value: {} };
jest.mock("../../hooks/usePublicBusinessProfile", () => ({
  __esModule: true,
  default: () => mockProfileState.value,
}));
jest.mock("../../hooks/usePublicCategories", () => ({
  __esModule: true,
  default: () => ({ data: { results: [] } }),
}));
jest.mock("./components/PublicProductGrid", () => ({
  __esModule: true,
  default: () => <div />,
}));
jest.mock("../../utils/utils", () => ({ ShowNotification: jest.fn() }));

const PROFILE = {
  business_name: "Mi Negocio",
  profile_image: "",
  description: "",
  categories: [],
  locations: [{ id: 1, name: "Centro", address: "Av. Siempre Viva 1" }],
  headquarter_attributes: [],
  social_links: [
    { id: 1, platform: "whatsapp", url: "595981000000", label: "", order: 0 },
    { id: 2, platform: "instagram", url: "mi_negocio", label: "", order: 1 },
    { id: 3, platform: "facebook", url: "mi.negocio", label: "", order: 2 },
  ],
};

let fetchMock: jest.Mock;

const renderPage = (entry = "/mi-negocio") =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/:businessId" element={<PublicBusinessProfilePage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

const flushNetwork = () => act(() => void jest.advanceTimersByTime(1500));
const types = () => sentEvents(fetchMock).map((e: any) => e.type);

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = setupAnalyticsEnv();
  mockProfileState.value = { data: PROFILE, isLoading: false, error: null };
  jest.spyOn(window, "open").mockImplementation(() => null);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("PublicBusinessProfilePage analytics", () => {
  it("emits catalog_visit once despite re-renders", () => {
    const { rerender } = renderPage();
    rerender(<div />);
    flushNetwork();
    expect(types()).toEqual(["catalog_visit"]);
  });

  it("does not emit while loading, on error or on 404", () => {
    mockProfileState.value = { data: undefined, isLoading: true, error: null };
    renderPage();
    mockProfileState.value = {
      data: undefined,
      isLoading: false,
      error: { response: { status: 404 } },
    };
    renderPage();
    flushNetwork();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("persists source=qr from the QR URL", () => {
    window.history.replaceState(null, "", "/mi-negocio?mk_source=qr");
    renderPage();
    flushNetwork();
    expect(sentEvents(fetchMock)[0]).toMatchObject({ type: "catalog_visit", source: "qr" });
  });

  it("is a no-op for a logged-in merchant", () => {
    useSessionStore.setState({ accessToken: "jwt" });
    renderPage();
    fireEvent.click(screen.getByLabelText("Ubicaciones"));
    flushNetwork();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports location, whatsapp, instagram and other clicks before opening the destination", () => {
    renderPage();
    const order: string[] = [];
    (window.open as jest.Mock).mockImplementation(() => {
      order.push("open");
      return null;
    });
    fireEvent.click(screen.getByLabelText("Ubicaciones"));
    fireEvent.click(screen.getByLabelText("WhatsApp"));
    fireEvent.click(screen.getByLabelText("Instagram"));
    fireEvent.click(screen.getByLabelText("Facebook"));
    flushNetwork();

    expect(window.open).toHaveBeenCalledTimes(4);
    const actions = sentEvents(fetchMock)
      .filter((e: any) => e.type === "action_click")
      .map((e: any) => e.action_type);
    expect(actions).toEqual(["location", "whatsapp", "instagram", "other"]);
  });

  it("does not delay or break navigation when analytics fails", () => {
    fetchMock.mockImplementation(() => {
      throw new Error("down");
    });
    renderPage();
    fireEvent.click(screen.getByLabelText("WhatsApp"));
    expect(() => flushNetwork()).not.toThrow();
    expect(window.open).toHaveBeenCalledTimes(1);
  });
});

describe("BusinessProfilePanel shared with admin", () => {
  it("sends no analytics and still opens the destination without onExternalAction", () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <BusinessProfilePanel
          name="Mi Negocio"
          categoriesText=""
          photo=""
          description=""
          attributes={[]}
          socialMedia={{ whatsapp: [{ id: 1, label: "", url: "595981000000" }] }}
          locations={[{ id: 1, name: "Centro", address: "Av. 1" } as any]}
        />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByLabelText("WhatsApp"));
    fireEvent.click(screen.getByLabelText("Ubicaciones"));
    jest.advanceTimersByTime(60_000);
    expect(window.open).toHaveBeenCalledTimes(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
