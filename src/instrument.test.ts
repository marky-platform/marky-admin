import { scrubSensitivePaths } from "./instrument";

describe("scrubSensitivePaths", () => {
  it("reemplaza uid y token de /reset-password en todo el evento", () => {
    const event = {
      request: { url: "https://app.marky.com/reset-password/MTI/abc-123?x=1" },
      breadcrumbs: [{ data: { from: "/login", to: "/reset-password/MTI/abc-123" } }],
    };
    const scrubbed = scrubSensitivePaths(event);
    expect(JSON.stringify(scrubbed)).not.toContain("abc-123");
    expect(scrubbed.request.url).toBe(
      "https://app.marky.com/reset-password/:uid/:token?x=1"
    );
    expect(scrubbed.breadcrumbs[0].data.to).toBe("/reset-password/:uid/:token");
  });

  it("devuelve el mismo evento si no hay rutas sensibles", () => {
    const event = { request: { url: "https://app.marky.com/home" } };
    expect(scrubSensitivePaths(event)).toBe(event);
  });
});
