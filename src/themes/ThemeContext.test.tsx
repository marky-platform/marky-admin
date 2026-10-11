import { act, render, screen } from "@testing-library/react";
import {
  CustomThemeProvider,
  getActiveColorScheme,
  useTheme,
} from "./ThemeContext";
import ThemeModeToggle from "../components/ThemeModeToggle";
import CancelButton from "../components/CancelButton";
import colors from "./utils/colors";
import { COLOR_MODE_STORAGE_KEY } from "./theme";

// jsdom has no matchMedia; MUI reads it for the system preference.
const mockSystemScheme = (scheme: "light" | "dark") => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches:
        scheme === "dark" && query.includes("prefers-color-scheme: dark"),
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
};

let controller: ReturnType<typeof useTheme>;
const Probe = () => {
  controller = useTheme();
  return <span data-testid="mode">{controller.resolvedMode}</span>;
};

const renderWithTheme = (ui: React.ReactNode = <Probe />) =>
  render(<CustomThemeProvider>{ui}</CustomThemeProvider>);

describe("color mode controller", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSystemScheme("light");
  });

  it("follows the OS (light) when nothing is stored", () => {
    renderWithTheme();

    expect(controller.mode).toBe("system");
    expect(controller.resolvedMode).toBe("light");
    expect(getActiveColorScheme()).toBe("light");
  });

  it("follows the OS (dark) when nothing is stored", () => {
    mockSystemScheme("dark");

    renderWithTheme();

    expect(controller.mode).toBe("system");
    expect(controller.resolvedMode).toBe("dark");
    expect(getActiveColorScheme()).toBe("dark");
  });

  it("toggles between light and dark and persists the choice", () => {
    renderWithTheme();

    act(() => controller.toggleMode());

    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    expect(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe("dark");
    expect(getActiveColorScheme()).toBe("dark");

    act(() => controller.toggleMode());

    expect(screen.getByTestId("mode")).toHaveTextContent("light");
    expect(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe("light");
  });

  it("restores the stored preference on mount", () => {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "dark");

    renderWithTheme();

    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });

  it("follows the system preference in system mode", () => {
    mockSystemScheme("dark");
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "system");

    renderWithTheme();

    expect(controller.mode).toBe("system");
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });

  it("resolves system mode to light when the OS prefers light", () => {
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, "system");

    renderWithTheme();

    expect(screen.getByTestId("mode")).toHaveTextContent("light");
  });
});

describe("shared components under both schemes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockSystemScheme("light");
  });

  it("ThemeModeToggle offers the opposite mode and switches on click", () => {
    renderWithTheme(
      <>
        <Probe />
        <ThemeModeToggle />
      </>,
    );

    act(() => screen.getByRole("button", { name: "Modo oscuro" }).click());

    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
    expect(
      screen.getByRole("button", { name: "Modo claro" }),
    ).toBeInTheDocument();
  });

  it.each(["light", "dark"] as const)(
    "CancelButton uses the %s scheme tokens",
    (scheme) => {
      window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, scheme);

      renderWithTheme(<CancelButton>Cancelar</CancelButton>);

      const style = getComputedStyle(
        screen.getByRole("button", { name: "Cancelar" }),
      );
      const hex = (value: string) => {
        const [r, g, b] = value.match(/\d+/g)!.map(Number);
        return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      };

      expect(hex(style.color).toUpperCase()).toBe(colors[scheme].text.black);
      expect(hex(style.backgroundColor).toUpperCase()).toBe(
        colors[scheme].grey[200],
      );
    },
  );
});
