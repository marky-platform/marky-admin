import { getVisitorId, isUuid, randomUuid, VISITOR_KEY } from "./identity";
import { resetStorageMemory } from "./storage";

describe("identity", () => {
  beforeEach(() => {
    localStorage.clear();
    resetStorageMemory();
  });
  afterEach(() => jest.restoreAllMocks());

  it("generates a visitor_id once and reuses it", () => {
    const first = getVisitorId();
    expect(isUuid(first)).toBe(true);
    expect(getVisitorId()).toBe(first);
    expect(localStorage.getItem(VISITOR_KEY)).toBe(first);
  });

  it("replaces a corrupted stored value", () => {
    localStorage.setItem(VISITOR_KEY, "not-a-uuid");
    expect(isUuid(getVisitorId())).toBe(true);
  });

  it("falls back to memory (stable per page load) when localStorage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const first = getVisitorId();
    expect(isUuid(first)).toBe(true);
    expect(getVisitorId()).toBe(first);
  });

  it("keeps a stable id when only writes fail", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const first = getVisitorId();
    expect(getVisitorId()).toBe(first);
  });

  const withCrypto = (value: unknown, run: () => void) => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", { configurable: true, value });
    try {
      run();
    } finally {
      if (original) Object.defineProperty(globalThis, "crypto", original);
      else delete (globalThis as any).crypto;
    }
  };

  it("uses crypto.randomUUID when available", () => {
    const id = "123e4567-e89b-42d3-a456-426614174000";
    withCrypto({ randomUUID: () => id }, () => expect(randomUuid()).toBe(id));
  });

  it("falls back to getRandomValues without crypto.randomUUID", () => {
    withCrypto(
      { getRandomValues: (a: Uint8Array) => a.fill(7) },
      () => expect(randomUuid()).toBe("07070707-0707-4707-8707-070707070707"),
    );
  });

  it("produces valid, distinct UUIDs without any crypto (no fingerprinting)", () => {
    withCrypto(undefined, () => {
      const a = randomUuid();
      expect(isUuid(a)).toBe(true);
      expect(randomUuid()).not.toBe(a);
    });
  });
});
