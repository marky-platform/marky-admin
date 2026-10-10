import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import lightTheme from "../../../themes/light";
import { BusinessInfo } from "./businessInfo";

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

const renderInfo = (onOpenEditProfile: jest.Mock) => {
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <BusinessInfo
          values={{ business_name: "Mi Negocio", socialMedia: {}, attributes: [] }}
          setFieldValue={jest.fn()}
          locations={[]}
          onOpenEditProfile={onOpenEditProfile}
          openDescriptionModal={jest.fn()}
          openAttributesModal={jest.fn()}
          onOpenPhotoPicker={jest.fn()}
        />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

afterEach(() => {
  delete (window as any).matchMedia;
});

describe("BusinessInfo profile identity", () => {
  it("mobile: edit pill beside the name opens the existing edit flow", () => {
    mockMobile(true);
    const onEdit = jest.fn();
    renderInfo(onEdit);

    fireEvent.click(screen.getByRole("button", { name: "Editar perfil" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Editar Perfil")).not.toBeInTheDocument();
  });

  it("desktop: no pill, the large Edit button remains", () => {
    mockMobile(false);
    renderInfo(jest.fn());

    expect(
      screen.queryByRole("button", { name: "Editar perfil" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
  });
});
