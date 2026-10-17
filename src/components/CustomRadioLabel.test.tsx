import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../themes/light";
import CustomRadioLabel from "./CustomRadioLabel";

const renderLabel = (
  props: Partial<React.ComponentProps<typeof CustomRadioLabel>> = {},
) =>
  render(
    <ThemeProvider theme={lightTheme}>
      <CustomRadioLabel label="Favorito" {...props} />
    </ThemeProvider>,
  );

describe("CustomRadioLabel", () => {
  it("text inherits the outer stopper color token instead of text.primary", () => {
    renderLabel();

    const expected = lightTheme.palette.fixed.stopperFavoriteTextCard;
    expect(screen.getByText("Favorito")).toHaveStyle({ color: expected });
    expect(expected).not.toBe(lightTheme.palette.text.primary);
  });

  it("fontColor still overrides the text color", () => {
    renderLabel({ fontColor: "rgb(1, 2, 3)" });

    expect(screen.getByText("Favorito")).toHaveStyle({ color: "rgb(1, 2, 3)" });
  });
});
