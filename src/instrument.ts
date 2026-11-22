import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

// Sentry (proyecto `marky-frontend`). Sin REACT_APP_SENTRY_DSN queda apagado
// (tests, local sin configurar). Las variables REACT_APP_* se fijan en el build.
const dsn = process.env.REACT_APP_SENTRY_DSN;

// /reset-password/:uid/:token lleva un token de un solo uso en la ruta: se
// reemplaza en todo el evento (URL, breadcrumbs de navegación, spans).
const RESET_PASSWORD_PATH = /\/reset-password\/[^/"?#\s]+\/[^/"?#\s]+/g;

export function scrubSensitivePaths<T>(event: T): T {
  const json = JSON.stringify(event);
  if (!RESET_PASSWORD_PATH.test(json)) return event;
  RESET_PASSWORD_PATH.lastIndex = 0;
  return JSON.parse(
    json.replace(RESET_PASSWORD_PATH, "/reset-password/:uid/:token")
  );
}
const isDev = process.env.NODE_ENV === "development";

if (dsn) {
  const tracesSampleRate = Number(
    process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || (isDev ? 1.0 : 0.1)
  );

  Sentry.init({
    dsn,
    // Explícito (qa | production), igual que en el backend.
    environment:
      process.env.REACT_APP_SENTRY_ENVIRONMENT ||
      (isDev ? "development" : "unknown"),
    // Release = SHA del commit (Vercel expone REACT_APP_VERCEL_GIT_COMMIT_SHA en apps CRA).
    release:
      process.env.REACT_APP_SENTRY_RELEASE ||
      process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ||
      undefined,
    integrations: [
      // Nombres de transacción parametrizados (/products/:id) en vez de URLs con IDs.
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate,
    // Sin cabeceras sentry-trace/baggage hacia la API: el CORS del backend no
    // las permite y romperían el preflight. Activar junto con CORS_ALLOW_HEADERS.
    tracePropagationTargets: [],
    // Sin PII ni Session Replay: los flujos de auth llevan emails y códigos
    // (también en la query string de los enlaces de verificación).
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    beforeSend: (event) => scrubSensitivePaths(event),
    // Con traceLifecycle "stream" (por defecto) los spans pasan por beforeSendSpan.
    beforeSendSpan: (span) => scrubSensitivePaths(span),
    // Ruido típico del navegador que no es un bug nuestro.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
    denyUrls: [/^chrome-extension:\/\//, /^moz-extension:\/\//, /^safari-(web-)?extension:\/\//],
  });
}
