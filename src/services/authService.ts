// src/services/authService.ts

import axios from "axios";
import { getLatestRefreshToken, useSessionStore } from "../stores/sessionStore";
import api from "./axiosConfig";

const baseURL = `${process.env.REACT_APP_API_URL}/users`;

interface LoginPayload {
  username?: string;
  password: string;
  // ... si tu login usa "username" o "email"
}

interface LoginResponse {
  access: string;
  refresh?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    has_configuration: boolean;
  };
}

interface RegisterPayload {
  email: string;
  password: string;
  business_name: string;
  phone_number: string;
}

interface RegisterResponse {
  message: string;
  user?: {
    id: number;
    username: string;
    email: string;
    has_configuration: boolean;
  };
}

interface VerifyEmailPayload {
  email: string;
  verification_code: string;
}

interface VerifyEmailResponse {
  message?: string;
  error?: string;
}

interface ResendVerificationPayload {
  email: string;
}

interface ResendVerificationResponse {
  message: string;
}

interface SendPasswordRecoveryPayload {
  email: string;
}

interface SendPasswordRecoveryResponse {
  email: string;
  message: string;
}

interface ChangePasswordPayload {
  uid: string;
  token: string;
  new_password: string;
}

interface ChangePasswordResponse {
  message: string;
}

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>(`${baseURL}/login/`, payload);

  // Destructuramos lo que la API devuelva:
  const { access, refresh, user } = response.data;

  // Guardo en la store de Zustand
  const { setSession } = useSessionStore.getState();
  setSession({
    accessToken: access,
    refreshToken: refresh || "", // si no hay refresh, pasas un string vacío
    user: user || null,
  });

  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<RegisterResponse>(
    `${baseURL}/register/`,
    payload
  );
  //
  const { user } = response.data;
  const { setSession } = useSessionStore.getState();
  setSession({
    accessToken: "",
    refreshToken: "",
    user: user || null,
  });

  return response.data;
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const response = await api.post<VerifyEmailResponse>(
    `${baseURL}/verify-email/`,
    payload
  );
  // Podría retornar { message: "Correo verificado con éxito." } o { error: "..."}
  return response.data;
}

export async function resendVerification(payload: ResendVerificationPayload) {
  const response = await api.post<ResendVerificationResponse>(
    `${baseURL}/resend-verification/`,
    payload
  );
  return response.data;
}

export async function sendPasswordRecovery(
  payload: SendPasswordRecoveryPayload
) {
  const response = await api.post<SendPasswordRecoveryResponse>(
    `${baseURL}/password-recovery/`,
    payload
  );
  return response.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.post<ChangePasswordResponse>(
    `${baseURL}/password-change/`,
    payload
  );
  return response.data;
}

/**
 * Revoca el refresh token en el backend (blacklist). Es "best effort": nunca
 * lanza, para que el cierre de sesión local ocurra aunque falle la red.
 * Usa axios plano (sin interceptores) para no disparar un refresh si el
 * access token ya expiró.
 */
export async function logout(
  // Por defecto, el token vivo del storage persistido (otra pestaña pudo rotarlo).
  // Quien limpia la sesión antes de llamar debe capturarlo y pasarlo aquí.
  refreshToken: string | null = getLatestRefreshToken()
): Promise<void> {
  if (!refreshToken) return;
  try {
    await axios.post(
      `${baseURL}/logout/`,
      { refresh: refreshToken },
      { timeout: 5000 }
    );
  } catch {
    // Ignorado a propósito: la sesión local se limpia igualmente.
  }
}
