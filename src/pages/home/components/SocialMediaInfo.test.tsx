import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../../../themes/light";
import SocialMediaInfo from "./SocialMediaInfo";
import { ChannelsByKey } from "../../../types/channel";
import { LocationEntryValue } from "./LocationsModal";

const renderInfo = (
  socialMedia: ChannelsByKey,
  locations: LocationEntryValue[] = [],
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <SocialMediaInfo
        socialMedia={socialMedia}
        locations={locations}
        businessName="Claude Test Business"
        onEmptyState={() => {}}
      />
    </ThemeProvider>,
  );

describe("SocialMediaInfo", () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it("opens a single configured WhatsApp number directly, with no count badge and no popup", () => {
    renderInfo({
      whatsapp: [{ id: 1, label: "Pedidos", url: "595911111111" }],
    });

    // No numeric badge for a single entry.
    expect(screen.queryByText("2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(openSpy).toHaveBeenCalledWith(
      "https://wa.me/595911111111",
      "_blank",
      "noopener,noreferrer",
    );
    // No selector popup was opened.
    expect(screen.queryByText("Canales WhatsApp")).not.toBeInTheDocument();
  });

  it("opens the selector popup for 2+ WhatsApp numbers, badge shows the count", () => {
    renderInfo({
      whatsapp: [
        { id: 1, label: "Pedidos", url: "595911111111" },
        { id: 2, label: "Atención", url: "595922222222" },
      ],
    });

    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(screen.getByText("Canales WhatsApp")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Atención"));
    expect(openSpy).toHaveBeenCalledWith(
      "https://wa.me/595922222222",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("opens a single configured Enlace directly", () => {
    renderInfo({
      link: [{ id: 1, label: "Menú", url: "https://www.sitio.com/menu" }],
    });

    expect(screen.queryByText("2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enlaces" }));
    expect(openSpy).toHaveBeenCalledWith(
      "https://www.sitio.com/menu",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("opens the selector popup for 2+ Enlaces", () => {
    renderInfo({
      link: [
        { id: 1, label: "Menú", url: "https://www.sitio.com/menu" },
        { id: 2, label: "Pedidos", url: "https://www.sitio.com/pedidos" },
      ],
    });

    fireEvent.click(screen.getByRole("button", { name: "Enlaces" }));
    expect(screen.getByText("Enlaces oficiales")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("opens a single location directly on Google Maps, with no popup", () => {
    renderInfo({}, [{ id: 1, name: "Sede principal", address: "Av. Siempre Viva 123" }]);

    fireEvent.click(screen.getByRole("button", { name: "Ubicaciones" }));
    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/maps/search/?api=1&query=Av.%20Siempre%20Viva%20123",
      "_blank",
      "noopener,noreferrer",
    );
    expect(screen.queryByText("Ubicaciones")).not.toBeInTheDocument();
  });

  it("opens the selector popup for 2+ locations, badge shows the count", () => {
    renderInfo({}, [
      { id: 1, name: "Sede principal", address: "Av. Siempre Viva 123" },
      { id: 2, name: "Sucursal Norte", address: "Calle Falsa 456" },
    ]);

    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ubicaciones" }));
    expect(screen.getByText("Ubicaciones")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Sucursal Norte"));
    expect(openSpy).toHaveBeenCalledWith(
      "https://www.google.com/maps/search/?api=1&query=Calle%20Falsa%20456",
      "_blank",
      "noopener,noreferrer",
    );
  });
});
