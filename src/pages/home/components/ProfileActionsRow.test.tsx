import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import ProfileActionsRow from "./ProfileActionsRow";

// JSDOM has no matchMedia: opt into the mobile viewport (down("md")) explicitly.
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

const renderRow = () =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ProfileActionsRow onEditProfile={jest.fn()} onSettings={jest.fn()} />
    </ThemeProvider>,
  );

afterEach(() => {
  delete (window as any).matchMedia;
});

describe("ProfileActionsRow", () => {
  it("keeps Edit, Settings and More actions on desktop", () => {
    mockMobile(false);
    renderRow();

    expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Más acciones" }),
    ).toBeInTheDocument();
  });

  it("renders nothing on mobile (no lower three-dots, Edit or Settings)", () => {
    mockMobile(true);
    renderRow();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument();
  });
});
