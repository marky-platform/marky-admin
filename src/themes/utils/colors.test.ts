import colors, { fixedColors } from "./colors";

describe("light theme palette (login page polish ticket)", () => {
  it("uses the updated brand blue as primary.main", () => {
    expect(colors.light.primary.main).toBe("#2563EB");
  });

  it("keeps the existing hover/dark blue", () => {
    expect(colors.light.primary.dark).toBe("#2962CB");
  });

  it("uses the updated body text color", () => {
    expect(colors.light.text.primary).toBe("#374151");
  });

  it("uses the updated placeholder/secondary text color", () => {
    expect(colors.light.text.disabled).toBe("#6B7280");
  });

  it("uses the updated input border color", () => {
    expect(colors.light.grey[800]).toBe("#AEB7C4");
  });

  it("uses white input backgrounds", () => {
    expect(colors.light.grey[100]).toBe("#FFFFFF");
  });
});

// Every scheme must define exactly the same token tree, with a real value.
const leafPaths = (node: unknown, prefix = ""): string[] =>
  typeof node === "object" && node !== null
    ? Object.entries(node).flatMap(([key, value]) =>
        leafPaths(value, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

const leafValues = (node: unknown): unknown[] =>
  typeof node === "object" && node !== null
    ? Object.values(node).flatMap(leafValues)
    : [node];

describe("color scheme completeness", () => {
  it("defines the same tokens in light and dark", () => {
    expect(leafPaths(colors.dark).sort()).toEqual(
      leafPaths(colors.light).sort(),
    );
  });

  it.each(["light", "dark"] as const)(
    "has a non-empty string for every %s token",
    (scheme) => {
      leafValues(colors[scheme]).forEach((value) => {
        expect(typeof value).toBe("string");
        expect((value as string).trim()).not.toBe("");
      });
    },
  );

  it("keeps fixed tokens out of the per-scheme palettes", () => {
    expect(Object.keys(fixedColors).length).toBeGreaterThan(0);
    expect(colors.light).not.toHaveProperty("fixed");
    expect(colors.dark).not.toHaveProperty("fixed");
  });
});
