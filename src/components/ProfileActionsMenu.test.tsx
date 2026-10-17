import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ShareIcon from "@mui/icons-material/Share";
import QrCodeIcon from "@mui/icons-material/QrCode";
import lightTheme from "../themes/light";
import ProfileActionsMenu, { ProfileActionItem } from "./ProfileActionsMenu";

const baseItems = (): ProfileActionItem[] => [
  { icon: ShareIcon, text: "Compartir perfil", onClick: jest.fn() },
  { icon: QrCodeIcon, text: "Descargar código QR", onClick: jest.fn() },
];

const renderMenu = (items = baseItems()) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <ProfileActionsMenu items={items} placement="below-end" />
    </ThemeProvider>,
  );

describe("ProfileActionsMenu", () => {
  it("exposes an accessible trigger and the given actions when opened", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Más acciones" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls");
    expect(screen.getAllByRole("menuitem").map((i) => i.textContent)).toEqual([
      "Compartir perfil",
      "Descargar código QR",
    ]);
  });

  it("closes the menu and calls the item's handler", () => {
    const onClick = jest.fn();
    renderMenu([{ ...baseItems()[0], onClick }]);

    fireEvent.click(screen.getByRole("button", { name: "Más acciones" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Compartir perfil" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Más acciones" }),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("renders destructive items in the error color", () => {
    renderMenu([
      ...baseItems(),
      { icon: FlagOutlinedIcon, text: "Reportar", onClick: jest.fn(), destructive: true },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Más acciones" }));

    expect(screen.getByRole("menuitem", { name: "Reportar" })).toHaveStyle({
      color: lightTheme.palette.error.main,
    });
    expect(
      screen.getByRole("menuitem", { name: "Descargar código QR" }),
    ).not.toHaveStyle({ color: lightTheme.palette.error.main });
  });
});
