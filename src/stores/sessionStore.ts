// src/stores/sessionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "../queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  business_name?: string;
  phone_number?: string;
  has_configuration: boolean;
}

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: User | null;
  }) => void;
  isAuthenticated: () => boolean;
  clearSession: () => void;
  updateUserConfiguration: (has_configuration: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),

      // logout
      clearSession: () => {
        // Business-scoped query data (home page, product grid, etc.) must not
        // survive an auth-context change: the QueryClient is a module-level
        // singleton that outlives the SPA navigation between accounts, so
        // without this a second business logging in on the same tab briefly
        // (or up to staleTime) sees the previous business's cached data.
        queryClient.clear();
        set({ accessToken: null, refreshToken: null, user: null });
      },

      isAuthenticated: () => !!get().accessToken,

      updateUserConfiguration: (has_configuration: boolean) =>
        set((state) => ({
          user: state.user ? { ...state.user, has_configuration } : null,
        })),
    }),
    {
      name: "session-storage", // localstorage key name
      // El refresh token SÍ se persiste: sin él, cualquier recarga de página
      // (cerrar pestaña, reiniciar el navegador) deja solo el access token
      // (vida útil de 30 min) en localStorage, y la sesión expira apenas
      // ese token vence. El access token ya vive en el mismo localStorage,
      // así que omitir el refresh token no aportaba protección real contra
      // XSS y sí rompía la persistencia de sesión.
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

/**
 * Lee el refresh token directamente del localStorage persistido (clave
 * `session-storage`). Con ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION,
 * otra pestaña puede haber rotado el token: el valor en memoria de esta
 * pestaña quedaría obsoleto (ya en la blacklist). Si no hay nada persistido
 * (o falla la lectura) se cae al valor en memoria.
 */
export function getLatestRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem("session-storage");
    if (raw) {
      const persisted = JSON.parse(raw)?.state?.refreshToken;
      if (typeof persisted === "string" && persisted) return persisted;
    }
  } catch {
    // localStorage inaccesible o JSON corrupto: usar el valor en memoria.
  }
  return useSessionStore.getState().refreshToken || null;
}
