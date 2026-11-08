// src/pages/Logout.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestRefreshToken, useSessionStore } from "../stores/sessionStore";
import { logout } from "../services/authService";
import { resetSessionExpiredNotice } from "../services/axiosConfig";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const clearSession = useSessionStore((state: any) => state.clearSession);

  useEffect(() => {
    // Se captura el refresh token ANTES de limpiar la sesión local.
    const refreshToken = getLatestRefreshToken();
    clearSession();
    // Permite que una futura expiración real vuelva a notificar.
    resetSessionExpiredNotice();
    navigate("/login");
    // Revocación best effort en el backend, sin esperar: logout() nunca lanza.
    if (refreshToken) void logout(refreshToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Logout;
