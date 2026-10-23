import {
  resolveSession,
  SESSION_TIMEOUT_MS,
  lastActivityKey,
  touchSessionActivity,
} from "./session";
import { resetStorageMemory } from "./storage";

const setVisible = (v: "visible" | "hidden") =>
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => v,
  });

describe("session", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageMemory();
    setVisible("visible");
  });

  it("reuses the session within 30 minutes and rotates after", () => {
    const t0 = 1_000_000;
    const a = resolveSession("biz", t0);
    expect(a.isNew).toBe(true);
    const b = resolveSession("biz", t0 + SESSION_TIMEOUT_MS - 1);
    expect(b).toEqual({ sessionId: a.sessionId, isNew: false });
    // La actividad se renovó en t0+30min-1; pasar 30 min + 1 ms rota.
    const c = resolveSession("biz", t0 + 2 * SESSION_TIMEOUT_MS);
    expect(c.isNew).toBe(true);
    expect(c.sessionId).not.toBe(a.sessionId);
  });

  it("rotates exactly after more than 30 minutes of inactivity", () => {
    const t0 = 5_000_000;
    const a = resolveSession("biz", t0);
    expect(resolveSession("biz", t0 + SESSION_TIMEOUT_MS).sessionId).toBe(a.sessionId);
    const x = resolveSession("other", t0);
    expect(resolveSession("other", t0 + SESSION_TIMEOUT_MS + 1).sessionId).not.toBe(
      x.sessionId,
    );
  });

  it("keeps separate sessions per business", () => {
    const a = resolveSession("biz-a", 1000);
    const b = resolveSession("biz-b", 1000);
    expect(a.sessionId).not.toBe(b.sessionId);
    expect(resolveSession("BIZ-A", 2000).sessionId).toBe(a.sessionId);
  });

  it("does not refresh activity while the tab is hidden", () => {
    resolveSession("biz", 1000);
    setVisible("hidden");
    resolveSession("biz", 5000);
    expect(localStorage.getItem(lastActivityKey("biz"))).toBe("1000");
    setVisible("visible");
    resolveSession("biz", 6000);
    expect(localStorage.getItem(lastActivityKey("biz"))).toBe("6000");
  });

  it("works from memory when storage is unavailable", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const a = resolveSession("biz", 1000);
    expect(resolveSession("biz", 2000).sessionId).toBe(a.sessionId);
    jest.restoreAllMocks();
  });

  describe("touchSessionActivity", () => {
    it("does not create a session", () => {
      expect(touchSessionActivity("biz", 1000)).toBe(false);
      expect(localStorage.getItem(lastActivityKey("biz"))).toBeNull();
    });

    it("refreshes a live session only while visible", () => {
      const t0 = 1_000_000;
      resolveSession("biz", t0);
      setVisible("hidden");
      expect(touchSessionActivity("biz", t0 + 1000)).toBe(false);
      expect(localStorage.getItem(lastActivityKey("biz"))).toBe(String(t0));
      setVisible("visible");
      expect(touchSessionActivity("biz", t0 + 1000)).toBe(true);
      expect(localStorage.getItem(lastActivityKey("biz"))).toBe(String(t0 + 1000));
    });

    it("does not revive an expired session", () => {
      const t0 = 1_000_000;
      resolveSession("biz", t0);
      expect(touchSessionActivity("biz", t0 + SESSION_TIMEOUT_MS + 1)).toBe(false);
      expect(localStorage.getItem(lastActivityKey("biz"))).toBe(String(t0));
    });
  });
});
