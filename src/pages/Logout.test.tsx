import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Logout from "./Logout";
import { logout } from "../services/authService";
import { useSessionStore } from "../stores/sessionStore";

jest.mock("../services/authService", () => ({
  logout: jest.fn(),
}));
jest.mock("../services/axiosConfig", () => ({
  resetSessionExpiredNotice: jest.fn(),
}));

const mockedLogout = logout as jest.Mock;

const seedSession = () =>
  useSessionStore.getState().setSession({
    accessToken: "access",
    refreshToken: "refresh",
    user: null,
  });

describe("Logout page", () => {
  beforeEach(() => {
    mockedLogout.mockReset();
    seedSession();
  });

  const renderLogout = () =>
    render(
      <MemoryRouter>
        <Logout />
      </MemoryRouter>,
    );

  it("clears the session right away and revokes the persisted token", async () => {
    mockedLogout.mockResolvedValue(undefined);
    renderLogout();
    await waitFor(() => expect(mockedLogout).toHaveBeenCalledTimes(1));
    // El token se captura antes de limpiar la sesión y se pasa como argumento.
    expect(mockedLogout).toHaveBeenCalledWith("refresh");
    expect(useSessionStore.getState().accessToken).toBeFalsy();
    expect(useSessionStore.getState().refreshToken).toBeFalsy();
  });

  it("clears the session even when the revoke call never resolves", async () => {
    mockedLogout.mockReturnValue(new Promise(() => {}));
    renderLogout();
    await waitFor(() =>
      expect(useSessionStore.getState().accessToken).toBeFalsy(),
    );
    expect(mockedLogout).toHaveBeenCalledWith("refresh");
  });

  it("still clears the session locally when the backend call fails", async () => {
    // authService.logout() traga todos los errores de red y resuelve igualmente.
    mockedLogout.mockResolvedValue(undefined);
    renderLogout();
    await waitFor(() =>
      expect(useSessionStore.getState().accessToken).toBeFalsy(),
    );
    expect(mockedLogout).toHaveBeenCalledWith("refresh");
  });
});
