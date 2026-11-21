import axios from "axios";
import { logout } from "./authService";
import { useSessionStore } from "../stores/sessionStore";

jest.mock("axios", () => ({
  __esModule: true,
  default: { post: jest.fn(), create: jest.fn() },
}));
jest.mock("./axiosConfig", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

const mockedPost = axios.post as jest.Mock;

describe("logout", () => {
  beforeEach(() => {
    mockedPost.mockReset();
    useSessionStore.getState().setSession({
      accessToken: "access",
      refreshToken: "refresh-token",
      user: null,
    });
  });

  it("sends the refresh token to the backend logout endpoint", async () => {
    mockedPost.mockResolvedValue({ status: 204 });
    await logout();
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/logout\/$/),
      { refresh: "refresh-token" },
      expect.objectContaining({ timeout: 5000 }),
    );
  });

  it("revokes the live token persisted by another tab, not the stale in-memory one", async () => {
    mockedPost.mockResolvedValue({ status: 204 });
    localStorage.setItem(
      "session-storage",
      JSON.stringify({
        state: { accessToken: "a", refreshToken: "refresh-live", user: null },
        version: 0,
      }),
    );
    await logout();
    expect(mockedPost.mock.calls[0][1]).toEqual({ refresh: "refresh-live" });
  });

  it("does not throw when the backend call fails", async () => {
    mockedPost.mockRejectedValue(new Error("network"));
    await expect(logout()).resolves.toBeUndefined();
  });

  it("skips the request when there is no refresh token", async () => {
    useSessionStore.getState().setSession({
      accessToken: "",
      refreshToken: "",
      user: null,
    });
    await logout();
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
