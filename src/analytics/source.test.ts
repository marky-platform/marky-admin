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

  it("accepts an explicit public_link tag", () => {
    window.history.replaceState(null, "", "/biz?mk_source=public_link");
    expect(resolveSource("biz")).toBe("public_link");
  });

  it("falls back to Link for values outside the allowlist", () => {
    window.history.replaceState(null, "", "/biz?mk_source=evil");
    expect(resolveSource("biz")).toBe("public_link");
  });

  it("falls back to Link for direct visits and never reads the referrer", () => {
    setReferrer("https://www.facebook.com/some/path?token=1");
    expect(resolveSource("biz")).toBe("public_link");
    const stored = JSON.stringify({ ...localStorage });
    expect(stored).not.toContain("facebook");
  });

  it("keeps the first source for the session when a later URL has none", () => {
    window.history.replaceState(null, "", "/biz?mk_source=qr");
    expect(resolveSource("biz")).toBe("qr");
    window.history.replaceState(null, "", "/biz/product/3");
    expect(resolveSource("biz")).toBe("qr");
  });

  it("forgets the source when the session rotates", () => {
    window.history.replaceState(null, "", "/biz?mk_source=qr");
    resolveSession("biz", 1000);
    expect(resolveSource("biz")).toBe("qr");
    resolveSession("biz", 1000 + 31 * 60 * 1000);
    expect(resolveSource("biz")).toBe("public_link");
  });
});
