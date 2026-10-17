import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../themes/light";
import { Header } from "./Header";
import { cssForClosest } from "./cssTestUtils";

// NotificationsMenu pulls in react-query + axios; it is irrelevant here.
jest.mock("./NotificationsMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="notifications" />,
}));

let mockProfileImage: string | undefined;
jest.mock("../hooks/useHomePageData", () => ({
  useHomePageData: () => ({ data: { profile_image: mockProfileImage } }),
}));

jest.mock("../stores/sessionStore", () => ({
  useSessionStore: () => ({ user: { business_name: "Biz", username: "u" } }),
}));

const mockMobile = (isMobile: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: isMobile && query.includes("max-width"),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

const renderHeader = (props: React.ComponentProps<typeof Header> = {}) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <Header {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );

const actions = <button aria-label="Más acciones">⋮</button>;

afterEach(() => {
  delete (window as any).matchMedia;
  mockProfileImage = undefined;
});

describe("Header", () => {
  it("without the Home props keeps the previous behavior on mobile", () => {
    mockMobile(true);
    renderHeader();

    expect(screen.getByTestId("notifications")).toBeInTheDocument();
    expect(screen.getByLabelText("user-menu")).toBeInTheDocument();
    expect(screen.queryByLabelText("Más acciones")).not.toBeInTheDocument();
  });

  it("shows one 'Más acciones' trigger in the top bar on mobile when given", () => {
    mockMobile(true);
    renderHeader({ businessPhoto: "", mobileActionsSlot: actions });

    expect(screen.getAllByLabelText("Más acciones")).toHaveLength(1);
    expect(screen.getByTestId("notifications")).toBeInTheDocument();
  });

  it("keeps the account menu on the avatar in the mobile variant", () => {
    mockMobile(true);
    renderHeader({ businessPhoto: "", mobileActionsSlot: actions });

    fireEvent.click(screen.getByLabelText("user-menu"));

    expect(screen.getByText("Mi cuenta")).toBeInTheDocument();
  });

  it("does not render the mobile actions on desktop", () => {
    mockMobile(false);
    renderHeader({ businessPhoto: "", mobileActionsSlot: actions });

    expect(screen.queryByLabelText("Más acciones")).not.toBeInTheDocument();
  });

  it.each([true, false])(
    "sizes the avatar trigger 34x34 and spaces header items 16px (mobile=%s)",
    (isMobile) => {
      mockMobile(isMobile);
      renderHeader({ businessPhoto: "", mobileActionsSlot: actions });

      expect(screen.getByLabelText("user-menu")).toHaveStyle({
        width: "34px",
        height: "34px",
      });
      expect(
        cssForClosest(screen.getByLabelText("user-menu"), ".MuiToolbar-root"),
      ).toMatch(/gap: 16px/);
    },
  );

  it.each([true, false])(
    "shows the business photo in the account avatar without props (mobile=%s)",
    (isMobile) => {
      mockMobile(isMobile);
      mockProfileImage = "https://cdn.test/negocio.png";
      renderHeader();

      expect(
        within(screen.getByLabelText("user-menu")).getByRole("img"),
      ).toHaveAttribute("src", "https://cdn.test/negocio.png");
    },
  );

  it("lets the businessPhoto prop override the business photo", () => {
    mockMobile(false);
    mockProfileImage = "https://cdn.test/negocio.png";
    renderHeader({ businessPhoto: "https://cdn.test/override.png" });

    expect(
      within(screen.getByLabelText("user-menu")).getByRole("img"),
    ).toHaveAttribute("src", "https://cdn.test/override.png");
  });

  it("falls back to the Marky watermark when the business has no photo", () => {
    mockMobile(false);
    renderHeader();

    expect(
      within(screen.getByLabelText("user-menu")).getByAltText("Marky"),
    ).toBeInTheDocument();
  });
});
