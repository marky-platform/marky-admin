import {
  analytics,
  FLUSH_DELAY_MS,
  MAX_ATTEMPTS,
  RETRY_DELAYS_MS,
  trackCatalogVisit,
} from "./client";
import { isUuid } from "./identity";
import { resolveSession, visitSentKey } from "./session";
import { storageSet } from "./storage";
import { advance, API, sentEvents, setupAnalyticsEnv, setVisibility } from "./testUtils";
import { useSessionStore } from "../stores/sessionStore";

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock = setupAnalyticsEnv();
});
afterEach(() => {
  jest.useRealTimers();
  delete (navigator as any).sendBeacon;
});

// Sesión ya iniciada y con su catalog_visit enviado (como en una página real).
const seedSession = () => {
  const { sessionId } = resolveSession("biz");
  storageSet(visitSentKey("biz"), sessionId);
};

describe("analytics client", () => {
  it("sends a batch as text/plain with keepalive and the frozen payload shape", async () => {
    seedSession();
    analytics.track("product_open", { businessId: "biz", productId: "42" });
    analytics.track("action_click", { businessId: "biz", actionType: "whatsapp" });
    expect(fetchMock).not.toHaveBeenCalled();

    jest.advanceTimersByTime(FLUSH_DELAY_MS);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/public/business/biz/analytics/events/`);
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    expect(init.headers).toEqual({ "Content-Type": "text/plain;charset=UTF-8" });
    const { events } = JSON.parse(init.body);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      type: "product_open",
      product_id: 42,
      source: "direct",
    });
    expect(events[1]).toMatchObject({ type: "action_click", action_type: "whatsapp" });
    expect(events[1].product_id).toBeUndefined();
    expect(isUuid(events[0].event_id)).toBe(true);
    expect(isUuid(events[0].visitor_id)).toBe(true);
    expect(isUuid(events[0].session_id)).toBe(true);
    expect(new Date(events[0].occurred_at).toISOString()).toBe(events[0].occurred_at);
  });

  it("is a no-op when disabled", () => {
    process.env.REACT_APP_ANALYTICS_ENABLED = "false";
    expect(analytics.track("catalog_visit", { businessId: "biz" })).toBeNull();
    jest.advanceTimersByTime(10_000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is a no-op when a merchant session exists", () => {
    useSessionStore.setState({ accessToken: "jwt" });
    expect(analytics.track("catalog_visit", { businessId: "biz" })).toBeNull();
    expect(trackCatalogVisit("biz")).toBeNull();
    analytics.flush({ beacon: true });
    jest.advanceTimersByTime(10_000);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects product events without a valid product id", () => {
    expect(analytics.track("product_view", { businessId: "biz" })).toBeNull();
    expect(
      analytics.track("product_open", { businessId: "biz", productId: "abc" }),
    ).toBeNull();
  });

  it("sends catalog_visit once per business/session", () => {
    expect(trackCatalogVisit("biz")).not.toBeNull();
    expect(trackCatalogVisit("biz")).toBeNull();
    expect(trackCatalogVisit("other")).not.toBeNull();
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    expect(sentEvents(fetchMock).filter((e: any) => e.type === "catalog_visit")).toHaveLength(2);
  });

  it("uses the persisted mk_source=qr for every event of the session", () => {
    window.history.replaceState(null, "", "/biz?mk_source=qr");
    trackCatalogVisit("biz");
    analytics.track("product_open", { businessId: "biz", productId: 1 });
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    expect(sentEvents(fetchMock).map((e: any) => e.source)).toEqual(["qr", "qr"]);
  });

  it("sends a single product_view per product/session", () => {
    expect(analytics.track("product_view", { businessId: "biz", productId: 1 })).not.toBeNull();
    expect(analytics.track("product_view", { businessId: "biz", productId: 1 })).toBeNull();
  });

  it("retries temporary failures preserving event_id, then gives up", async () => {
    seedSession();
    fetchMock.mockResolvedValue({ ok: false, status: 503 });
    const id = analytics.track("action_click", { businessId: "biz", actionType: "other" });

    const seen: string[] = [];
    for (let i = 0; i < MAX_ATTEMPTS + 2; i += 1) {
      await advance(
        Math.max(FLUSH_DELAY_MS, ...RETRY_DELAYS_MS),
      );
    }
    sentEvents(fetchMock).forEach((e: any) => seen.push(e.event_id));
    expect(fetchMock).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    expect(new Set(seen)).toEqual(new Set([id]));
  });

  it("retries network errors", async () => {
    seedSession();
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    await advance(FLUSH_DELAY_MS);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(RETRY_DELAYS_MS[0]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [a, b] = sentEvents(fetchMock);
    expect(a.event_id).toBe(b.event_id);
  });

  it.each([400, 404])("does not retry a %i response", async (status) => {
    fetchMock.mockResolvedValue({ ok: false, status });
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    await advance(60_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses sendBeacon with a text/plain blob on pagehide", () => {
    const beacon = jest.fn().mockReturnValue(true);
    (navigator as any).sendBeacon = beacon;
    analytics.track("action_click", { businessId: "biz", actionType: "location" });
    window.dispatchEvent(new Event("pagehide"));

    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0][0]).toBe(`${API}/public/business/biz/analytics/events/`);
    expect((beacon.mock.calls[0][1] as Blob).type.toLowerCase()).toBe("text/plain;charset=utf-8");
    expect(fetchMock).not.toHaveBeenCalled();
    // Ya vaciado: el temporizador no reenvía.
    jest.advanceTimersByTime(60_000);
    expect(beacon).toHaveBeenCalledTimes(1);
  });

  it("falls back to fetch keepalive when sendBeacon is missing or refuses", () => {
    analytics.track("action_click", { businessId: "biz", actionType: "location" });
    setVisibility("hidden");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);

    (navigator as any).sendBeacon = jest.fn().mockReturnValue(false);
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    window.dispatchEvent(new Event("pagehide"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("never throws or blocks when fetch throws synchronously or is missing", () => {
    fetchMock.mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() => {
      analytics.track("action_click", { businessId: "biz", actionType: "other" });
      jest.advanceTimersByTime(FLUSH_DELAY_MS);
    }).not.toThrow();
    delete (global as any).fetch;
    expect(() => {
      analytics.track("action_click", { businessId: "biz", actionType: "other" });
      jest.advanceTimersByTime(60_000);
    }).not.toThrow();
  });

  it("splits batches of more than 20 events", () => {
    for (let i = 0; i < 25; i += 1) {
      analytics.track("action_click", { businessId: "biz", actionType: "other" });
    }
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).events).toHaveLength(20);
  });

  it("keeps working when localStorage is unavailable (memory fallback)", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    const [a, b] = sentEvents(fetchMock);
    expect(a.session_id).toBe(b.session_id);
    expect(a.visitor_id).toBe(b.visitor_id);
    jest.restoreAllMocks();
  });

  it("rotates the session after 30 minutes but keeps the visitor", () => {
    seedSession();
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    jest.advanceTimersByTime(31 * 60 * 1000);
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    const clicks = sentEvents(fetchMock).filter((e: any) => e.type === "action_click");
    const [a, b] = clicks;
    expect(a.session_id).not.toBe(b.session_id);
    expect(a.visitor_id).toBe(b.visitor_id);
  });

  it("opens a rotated session with its catalog_visit before product/action events", () => {
    seedSession();
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    jest.advanceTimersByTime(31 * 60 * 1000);
    analytics.track("product_open", { businessId: "biz", productId: 3 });
    analytics.track("action_click", { businessId: "biz", actionType: "other" });
    jest.advanceTimersByTime(FLUSH_DELAY_MS);
    const events = sentEvents(fetchMock);
    expect(events.map((e: any) => e.type)).toEqual([
      "action_click",
      "catalog_visit",
      "product_open",
      "action_click",
    ]);
    expect(events[1].session_id).toBe(events[2].session_id);
    expect(events[1].session_id).not.toBe(events[0].session_id);
    // Una sola visita por sesión nueva.
    expect(events.filter((e: any) => e.type === "catalog_visit")).toHaveLength(1);
  });
});
