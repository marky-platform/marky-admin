import { act, renderHook } from "@testing-library/react";
import { useCatalogVisit, useProductAnalytics } from "./hooks";
import { sentEvents, setupAnalyticsEnv, setVisibility } from "./testUtils";

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = setupAnalyticsEnv();
});
afterEach(() => jest.useRealTimers());

const types = () => sentEvents(fetchMock).map((e: any) => e.type);
const tick = (ms: number) => act(() => void jest.advanceTimersByTime(ms));
const engagedTotal = () =>
  sentEvents(fetchMock)
    .filter((e: any) => e.type === "product_engagement")
    .reduce((n: number, e: any) => n + e.engaged_ms, 0);

describe("useCatalogVisit", () => {
  it("emits catalog_visit once despite re-renders, and not before ready", () => {
    const { rerender } = renderHook(({ ready }) => useCatalogVisit("biz", ready), {
      initialProps: { ready: false },
    });
    tick(2000);
    expect(fetchMock).not.toHaveBeenCalled();

    rerender({ ready: true });
    rerender({ ready: true });
    rerender({ ready: true });
    tick(2000);
    expect(types()).toEqual(["catalog_visit"]);
  });
});

describe("useProductAnalytics", () => {
  const setup = (productId?: number | null) =>
    renderHook(({ id }) => useProductAnalytics("biz", id ?? undefined), {
      initialProps: { id: productId === null ? undefined : (productId ?? 7) },
    });

  it("deep link: exactly one catalog_visit plus product_open", () => {
    setup();
    tick(1000);
    expect(types().sort()).toEqual(["catalog_visit", "product_open"]);
  });

  it("emits nothing without a resolved product", () => {
    setup(null);
    tick(60_000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not confirm a view at 2.9 s but does at 3 s visible", () => {
    setup();
    tick(2900);
    expect(types()).not.toContain("product_view");
    tick(100);
    tick(1000);
    expect(types()).toContain("product_view");
    expect(
      sentEvents(fetchMock).find((e: any) => e.type === "product_view").product_id,
    ).toBe(7);
  });

  it("pauses the view timer while hidden and restarts it on return", () => {
    setup();
    tick(2000);
    setVisibility("hidden");
    tick(60_000);
    expect(types()).not.toContain("product_view");
    setVisibility("visible");
    tick(2900);
    expect(types()).not.toContain("product_view");
    tick(100);
    tick(1000);
    expect(types()).toContain("product_view");
  });

  it("counts only visible time as engagement", () => {
    setup();
    tick(10_000); // visible 10 s
    setVisibility("hidden"); // flush del resto
    tick(20_000); // oculto: no cuenta
    setVisibility("visible");
    tick(5000);
    setVisibility("hidden");
    tick(2000);
    expect(engagedTotal()).toBe(15_000);
  });

  it("sends engagement chunks every 15 s (each <= 30 s) after a confirmed view", () => {
    setup();
    tick(15_000);
    tick(1000); // flush de red
    const chunks = sentEvents(fetchMock).filter(
      (e: any) => e.type === "product_engagement",
    );
    expect(chunks).toHaveLength(1);
    expect(chunks[0].engaged_ms).toBe(15_000);
    expect(chunks[0].engaged_ms).toBeLessThanOrEqual(30_000);
  });

  it("sends no view or engagement when leaving before 3 s", () => {
    const { unmount } = setup();
    tick(2900);
    unmount();
    tick(60_000);
    expect(types().sort()).toEqual(["catalog_visit", "product_open"]);
  });

  it("flushes the remainder on pagehide through sendBeacon", async () => {
    const bodies: Blob[] = [];
    (navigator as any).sendBeacon = jest.fn((_url: string, blob: Blob) => {
      bodies.push(blob);
      return true;
    });
    setup();
    tick(4000);
    window.dispatchEvent(new Event("pagehide"));
    expect(bodies.length).toBeGreaterThan(0);
    const events = (
      await Promise.all(bodies.map((b) => new Response(b).text().catch(() => "")))
    ).flatMap((t) => (t ? JSON.parse(t).events : []));
    delete (navigator as any).sendBeacon;
    expect(events.map((e: any) => e.type)).toContain("product_engagement");
  });

  it("cleans up timers on unmount and sends the confirmed remainder", () => {
    const { unmount } = setup();
    tick(5000);
    unmount();
    tick(1000);
    expect(engagedTotal()).toBe(5000);
    const before = fetchMock.mock.calls.length;
    tick(120_000);
    expect(fetchMock.mock.calls.length).toBe(before);
  });

  it("cancels the pending view and restarts when the product changes", () => {
    const { rerender } = setup(1);
    tick(2000);
    rerender({ id: 2 });
    tick(1500); // A: 3.5 s en total, pero B solo 1.5 s
    expect(types()).not.toContain("product_view");
    tick(1500);
    tick(1000);
    const views = sentEvents(fetchMock).filter((e: any) => e.type === "product_view");
    expect(views.map((e: any) => e.product_id)).toEqual([2]);
    expect(
      sentEvents(fetchMock).filter((e: any) => e.type === "product_open").map((e: any) => e.product_id),
    ).toEqual([1, 2]);
  });

  it("five opens in one session: five opens, one view, one catalog_visit", () => {
    for (let i = 0; i < 5; i += 1) {
      const { unmount } = setup();
      tick(3500);
      unmount();
    }
    tick(2000);
    const t = types();
    expect(t.filter((x) => x === "product_open")).toHaveLength(5);
    expect(t.filter((x) => x === "product_view")).toHaveLength(1);
    expect(t.filter((x) => x === "catalog_visit")).toHaveLength(1);
  });
});
