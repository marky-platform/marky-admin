import { render, screen } from "@testing-library/react";
import { CHANNEL_META } from "./channels.constants";

jest.mock("../../../../mappers/channelMapper", () => ({
  CHANNEL_URL_PREFIXES: {
    instagram: "",
    facebook: "",
    tiktok: "",
    whatsapp: "",
    link: "",
  },
}));

describe("CHANNEL_META icons", () => {
  it("uses the supplied link.svg asset for the Link channel", () => {
    const Icon = CHANNEL_META.link.icon;
    render(<Icon data-testid="channel-icon" />);

    // CRA's Jest SVG transform renders the file name as the svg's text.
    expect(screen.getByTestId("channel-icon")).toHaveTextContent("link.svg");
  });
});
