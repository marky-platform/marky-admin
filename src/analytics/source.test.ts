import { resolveSession } from "./session";
import { resolveSource, withSourceParam } from "./source";
import { resetStorageMemory } from "./storage";

const setReferrer = (value: string) =>
  Object.defineProperty(document, "referrer", { configurable: true, get: () => value });

describe("source", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageMemory();
    window.history.replaceState(null, "", "/");
    setReferrer("");
  });

  it("tags urls", () => {
    expect(withSourceParam("https://marky.one/biz", "qr")).toBe(
      "https://marky.one/biz?mk_source=qr",
    );
  });

  it("persists mk_source=qr for the session and strips it from the URL", () => {
    window.history.replaceState(null, "", "/biz?mk_source=qr&x=1");
    expect(resolveSource("biz")).toBe("qr");
    expect(window.location.search).toBe("?x=1");
    expect(resolveSource("biz")).toBe("qr");
  });

  it("ignores values outside the allowlist", () => {
    window.history.replaceState(null, "", "/biz?mk_source=evil");
    expect(resolveSource("biz")).toBe("direct");
  });

  it("classifies by referrer category without storing the referrer", () => {
    setReferrer("https://www.facebook.com/some/path?token=1");
    expect(resolveSource("biz")).toBe("other");
    const stored = JSON.stringify({ ...localStorage });
    expect(stored).not.toContain("facebook");
  });

  it("treats an empty or same-origin referrer as direct", () => {
    expect(resolveSource("a")).toBe("direct");
    setReferrer(`${window.location.origin}/x`);
    expect(resolveSource("b")).toBe("direct");
  });

  it("forgets the source when the session rotates", () => {
    window.history.replaceState(null, "", "/biz?mk_source=qr");
    resolveSession("biz", 1000);
    expect(resolveSource("biz")).toBe("qr");
    resolveSession("biz", 1000 + 31 * 60 * 1000);
    expect(resolveSource("biz")).toBe("direct");
  });
});
