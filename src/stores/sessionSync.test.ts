import { queryClient } from "../queryClient";
import { resetSessionExpiredNotice } from "../services/axiosConfig";

import { useSessionStore } from "./sessionStore";
import { handleSessionStorageEvent, startSessionSync } from "./sessionSync";

// axiosConfig importa axios (ESM) que Jest/CRA no transforma: se mockea.
jest.mock("../services/axiosConfig", () => ({
  resetSessionExpiredNotice: jest.fn(),
}));

const persisted = (
  accessToken: string | null,
  refreshToken: string | null,
  hasConfiguration = true
) =>
  JSON.stringify({
    state: {
      accessToken,
      refreshToken,
      user: accessToken
        ? { id: 1, username: "u", email: "u@x.com", has_configuration: hasConfiguration }
        : null,
    },
    version: 0,
  });

const storageEvent = (key: string | null, newValue: string | null) =>
  ({ key, newValue } as StorageEvent);

describe("handleSessionStorageEvent (sincronización entre pestañas)", () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({
      accessToken: "a1",
      refreshToken: "r1",
      user: {
        id: 1,
        username: "u",
        email: "u@x.com",
        has_configuration: true,
      },
    });
  });

  it("limpia la sesión local cuando otra pestaña hace logout", () => {
    const clearSpy = jest.spyOn(queryClient, "clear");
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted(null, null))
    );
    const s = useSessionStore.getState();
    expect(s.accessToken).toBeNull();
    expect(s.refreshToken).toBeNull();
    expect(s.user).toBeNull();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("limpia la sesión cuando la clave se elimina (newValue null)", () => {
    handleSessionStorageEvent(storageEvent("session-storage", null));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it("limpia la sesión con localStorage.clear() (key null)", () => {
    handleSessionStorageEvent(storageEvent(null, null));
    expect(useSessionStore.getState().accessToken).toBeNull();
  });

  it("adopta el login hecho en otra pestaña", () => {
    useSessionStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a2", "r2"))
    );
    const s = useSessionStore.getState();
    expect(s.accessToken).toBe("a2");
    expect(s.refreshToken).toBe("r2");
    expect(s.user?.email).toBe("u@x.com");
  });

  it("adopta tokens rotados por otra pestaña sin limpiar la caché", () => {
    const clearSpy = jest.spyOn(queryClient, "clear");
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a2", "r2"))
    );
    expect(useSessionStore.getState().accessToken).toBe("a2");
    expect(clearSpy).not.toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("ignora otras claves y valores corruptos", () => {
    handleSessionStorageEvent(storageEvent("otra-clave", persisted(null, null)));
    handleSessionStorageEvent(storageEvent("session-storage", "{no-json"));
    expect(useSessionStore.getState().accessToken).toBe("a1");
  });

  it("no reescribe localStorage si el estado remoto ya coincide (sin bucles)", () => {
    const setItem = jest.spyOn(Storage.prototype, "setItem");
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a1", "r1"))
    );
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("adopta un cambio de user (has_configuration) aunque los tokens no cambien", () => {
    const clearSpy = jest.spyOn(queryClient, "clear");
    useSessionStore.setState({
      user: {
        id: 1,
        username: "u",
        email: "u@x.com",
        has_configuration: false,
      },
    });
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a1", "r1", true))
    );
    expect(useSessionStore.getState().user?.has_configuration).toBe(true);
    expect(clearSpy).not.toHaveBeenCalled(); // mismo usuario: no se limpia la caché
    clearSpy.mockRestore();
  });

  it("no reescribe nada si tokens y user remotos ya coinciden (sin bucles)", () => {
    const listener = jest.fn();
    const unsub = useSessionStore.subscribe(listener);
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a1", "r1", true))
    );
    unsub();
    expect(listener).not.toHaveBeenCalled();
  });

  it("en un logout remoto fija el estado ANTES de limpiar la caché", () => {
    const order: string[] = [];
    const unsub = useSessionStore.subscribe((st) => {
      if (!st.accessToken) order.push("setState");
    });
    const clearSpy = jest
      .spyOn(queryClient, "clear")
      .mockImplementation(() => {
        order.push("clear");
      });
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted(null, null))
    );
    unsub();
    clearSpy.mockRestore();
    expect(order).toEqual(["setState", "clear"]);
  });

  it("resetea el aviso de sesión expirada en logout y login remotos", () => {
    const resetSpy = resetSessionExpiredNotice as jest.Mock;
    resetSpy.mockClear();
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted(null, null))
    );
    expect(resetSpy).toHaveBeenCalledTimes(1);
    handleSessionStorageEvent(
      storageEvent("session-storage", persisted("a2", "r2"))
    );
    expect(resetSpy).toHaveBeenCalledTimes(2);
  });

  it("startSessionSync registra el listener y devuelve una función para quitarlo", () => {
    const stop = startSessionSync();
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "session-storage",
        newValue: persisted(null, null),
      })
    );
    expect(useSessionStore.getState().accessToken).toBeNull();
    stop();
    useSessionStore.setState({ accessToken: "a9", refreshToken: "r9" });
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "session-storage",
        newValue: persisted(null, null),
      })
    );
    expect(useSessionStore.getState().accessToken).toBe("a9");
  });
});
