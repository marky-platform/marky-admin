import { queryClient } from "../queryClient";
import { resetSessionExpiredNotice } from "../services/axiosConfig";
import { useSessionStore } from "./sessionStore";

const STORAGE_KEY = "session-storage";

/**
 * Reacciona a un evento `storage` (disparado SOLO en las demás pestañas)
 * sobre la clave persistida de la sesión, para que un logout o login hecho
 * en una pestaña se refleje en las otras.
 *
 * - `newValue` null (clave eliminada) o `key` null (`localStorage.clear()`)
 *   equivale a un logout.
 * - Si tokens y user remotos ya coinciden con los locales no se hace nada: así
 *   no se reescribe localStorage por una actualización remota (sin bucles).
 * - Se usa `setState` y no `clearSession()` para no volver a disparar la
 *   escritura/limpieza de la otra pestaña; la caché de queries sí se limpia
 *   cuando la sesión remota terminó, igual que en un logout local.
 */
export function handleSessionStorageEvent(
  event: Pick<StorageEvent, "key" | "newValue">
): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;

  let next: {
    accessToken: string | null;
    refreshToken: string | null;
    user: ReturnType<typeof useSessionStore.getState>["user"];
  };

  if (event.newValue === null) {
    next = { accessToken: null, refreshToken: null, user: null };
  } else {
    try {
      const state = JSON.parse(event.newValue)?.state;
      if (!state || typeof state !== "object") return;
      next = {
        accessToken:
          typeof state.accessToken === "string" ? state.accessToken : null,
        refreshToken:
          typeof state.refreshToken === "string" ? state.refreshToken : null,
        user: state.user ?? null,
      };
    } catch {
      return; // JSON corrupto: ignorar.
    }
  }

  const current = useSessionStore.getState();
  // Igualdad profunda del user (JSON): un cambio solo de `user` (p. ej.
  // has_configuration tras terminar la configuración en otra pestaña) también
  // debe adoptarse. Si todo coincide no se hace nada (sin bucles).
  if (
    current.accessToken === next.accessToken &&
    current.refreshToken === next.refreshToken &&
    JSON.stringify(current.user) === JSON.stringify(next.user)
  ) {
    return;
  }

  const wasLoggedIn = !!current.accessToken;
  const clearCache = !next.accessToken || current.user?.id !== next.user?.id;

  // Primero el estado y después la caché: si se limpiara antes, los
  // observers activos podrían refetchear con el access token ya obsoleto
  // (401, toast de sesión expirada, refresh con un token en blacklist).
  useSessionStore.setState(next);

  // Otra pestaña cerró sesión (o cambió de cuenta): no conservar datos del
  // negocio anterior en la caché de esta pestaña.
  if (clearCache) queryClient.clear();

  // Logout/login remoto = sesión nueva: que una expiración real posterior
  // vuelva a avisar al usuario.
  if (wasLoggedIn !== !!next.accessToken) resetSessionExpiredNotice();
}

/** Registra el listener; devuelve la función para quitarlo. */
export function startSessionSync(): () => void {
  window.addEventListener("storage", handleSessionStorageEvent);
  return () => window.removeEventListener("storage", handleSessionStorageEvent);
}
