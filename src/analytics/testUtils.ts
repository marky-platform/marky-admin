import { useSessionStore } from "../stores/sessionStore";
import { resetAnalyticsClient } from "./client";
import { resetStorageMemory } from "./storage";

export const API = "http://api.test/api/v1";

export const setVisibility = (state: "visible" | "hidden") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
};

// Estado limpio + analytics habilitado + fetch simulado.
export const setupAnalyticsEnv = (): jest.Mock => {
  process.env.REACT_APP_ANALYTICS_ENABLED = "true";
  process.env.REACT_APP_API_URL = API;
  localStorage.clear();
  resetStorageMemory();
  resetAnalyticsClient();
  useSessionStore.setState({ accessToken: null });
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  });
  window.history.replaceState(null, "", "/");
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 202 });
  (global as any).fetch = fetchMock;
  return fetchMock;
};

export const sentEvents = (fetchMock: jest.Mock) =>
  fetchMock.mock.calls.flatMap(([, init]) => JSON.parse(init.body).events);

// Jest 27 no trae advanceTimersByTimeAsync: avanza y deja correr microtareas.
export const advance = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};
