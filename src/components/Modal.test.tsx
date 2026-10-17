import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../themes/light";
import CustomModal from "./Modal";
import { cssForParent, cssForSelector } from "./cssTestUtils";

const renderModal = (sx?: object) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <CustomModal open onClose={jest.fn()} title="Titulo" sx={sx}>
        <p>Contenido</p>
      </CustomModal>
    </ThemeProvider>,
  );

describe("CustomModal small-screen defaults", () => {
  it("bounds width and height to the viewport and lays out as a column", () => {
    renderModal();
    const css = cssForSelector("[tabindex='-1']");

    expect(css).toContain("max-width: calc(100vw - 32px)");
    expect(css).toContain("max-height: calc(100dvh - 32px)");
    expect(css).toContain("flex-direction: column");
  });

  it("scrolls the body region while header and footer stay visible", () => {
    renderModal();
    const css = cssForParent(screen.getByText("Contenido"));

    expect(css).toContain("overflow-y: auto");
  });

  it("lets the caller override the defaults", () => {
    renderModal({ maxWidth: 400 });
    const css = cssForSelector("[tabindex='-1']");

    expect(css).toContain("max-width: 400px");
    expect(css).not.toContain("max-width: calc(100vw - 32px)");
  });
});
