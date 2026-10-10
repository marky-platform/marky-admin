import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../themes/light";
import { Header } from "./Header";

// NotificationsMenu pulls in react-query + axios; it is irrelevant here.
jest.mock("./NotificationsMenu", () => ({
  __esModule: true,
  default: () => <div data-testid="notifications" />,
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
});
