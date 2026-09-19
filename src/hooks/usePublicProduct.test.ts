import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import usePublicProduct from "./usePublicProduct";
import { getPublicProduct } from "../services/publicService";

jest.mock("../services/publicService", () => ({
  getPublicProduct: jest.fn(),
}));

const mockedGetPublicProduct = getPublicProduct as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("usePublicProduct", () => {
  beforeEach(() => {
    mockedGetPublicProduct.mockReset();
  });

  it("does not fire a request when productId is NaN (e.g. a non-numeric :id route segment)", () => {
    const { result } = renderHook(
      () => usePublicProduct("dulce-momento", Number("abc")),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedGetPublicProduct).not.toHaveBeenCalled();
  });

  it("fires a request for a real numeric productId", () => {
    mockedGetPublicProduct.mockResolvedValue({});
    renderHook(() => usePublicProduct("dulce-momento", 42), { wrapper });

    expect(mockedGetPublicProduct).toHaveBeenCalledWith("dulce-momento", 42);
  });
});
