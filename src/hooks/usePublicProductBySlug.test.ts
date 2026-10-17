import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import usePublicProductBySlug from "./usePublicProductBySlug";
import { getPublicProductBySlug } from "../services/publicService";

jest.mock("../services/publicService", () => ({
  getPublicProductBySlug: jest.fn(),
}));

const mockedGet = getPublicProductBySlug as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    QueryClientProvider,
    { client: new QueryClient() },
    children,
  );

describe("usePublicProductBySlug", () => {
  beforeEach(() => mockedGet.mockReset());

  it("does not fire a request while a slug param is missing", () => {
    const { result } = renderHook(
      () => usePublicProductBySlug("dulce-momento", "postres", undefined),
      { wrapper },
    );
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("fetches by business, category and product slug", () => {
    mockedGet.mockResolvedValue({});
    renderHook(
      () => usePublicProductBySlug("dulce-momento", "postres", "torta"),
      { wrapper },
    );
    expect(mockedGet).toHaveBeenCalledWith("dulce-momento", "postres", "torta");
  });
});
