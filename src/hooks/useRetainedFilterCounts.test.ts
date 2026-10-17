import { renderHook } from "@testing-library/react";
import useRetainedFilterCounts from "./useRetainedFilterCounts";

describe("useRetainedFilterCounts", () => {
  it("returns undefined until the first counts arrive", () => {
    const { result } = renderHook(() => useRetainedFilterCounts(undefined));
    expect(result.current).toBeUndefined();
  });

  it("keeps the previous pair while the next response is loading", () => {
    const { result, rerender } = renderHook(
      ({ counts }) => useRetainedFilterCounts(counts),
      {
        initialProps: {
          counts: { promotion: 3, featured: 2 } as any,
        },
      },
    );
    expect(result.current).toEqual({ promotion: 3, featured: 2 });

    rerender({ counts: undefined });
    expect(result.current).toEqual({ promotion: 3, featured: 2 });
  });

  it("updates both counters together when a new pair arrives", () => {
    const { result, rerender } = renderHook(
      ({ counts }) => useRetainedFilterCounts(counts),
      {
        initialProps: {
          counts: { promotion: 3, featured: 2 } as any,
        },
      },
    );
    rerender({ counts: undefined });
    rerender({ counts: { promotion: 0, featured: 5 } });
    expect(result.current).toEqual({ promotion: 0, featured: 5 });
  });

  it("ignores a partial pair instead of mixing old and new values", () => {
    const { result, rerender } = renderHook(
      ({ counts }) => useRetainedFilterCounts(counts),
      {
        initialProps: {
          counts: { promotion: 3, featured: 2 } as any,
        },
      },
    );
    rerender({ counts: { promotion: 9 } });
    expect(result.current).toEqual({ promotion: 3, featured: 2 });
  });

  it("drops the retained pair when the reset key changes", () => {
    const { result, rerender } = renderHook(
      ({ counts, key }) => useRetainedFilterCounts(counts, key),
      {
        initialProps: {
          counts: { promotion: 3, featured: 2 } as any,
          key: "negocio-a",
        },
      },
    );
    rerender({ counts: undefined, key: "negocio-b" });
    expect(result.current).toBeUndefined();
  });
});
