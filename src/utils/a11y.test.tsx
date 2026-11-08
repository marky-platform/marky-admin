import { fireEvent, render, screen } from "@testing-library/react";
import { Box, IconButton } from "@mui/material";
import { clickableProps } from "./a11y";

describe("clickableProps", () => {
  it("expone el contenedor como botón y lo activa con Enter y Espacio", () => {
    const onClick = jest.fn();
    render(
      <Box onClick={onClick} {...clickableProps}>
        Abrir
      </Box>
    );
    const el = screen.getByRole("button", { name: "Abrir" });
    expect(el).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.keyDown(el, { key: " " });
    fireEvent.keyDown(el, { key: "a" });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("ignora teclas que vienen de un control hijo", () => {
    const onClick = jest.fn();
    render(
      <Box onClick={onClick} {...clickableProps}>
        <IconButton aria-label="Interno" />
      </Box>
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Interno" }), {
      key: "Enter",
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});
