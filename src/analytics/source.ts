import { sourceKey } from "./session";
import { storageGet, storageSet } from "./storage";
import type { AnalyticsSource } from "./types";

export const SOURCE_PARAM = "mk_source";

export const ANALYTICS_SOURCES: readonly AnalyticsSource[] = [
  "public_link",
  "qr",
  "direct",
  "other",
];

export const isAnalyticsSource = (value: unknown): value is AnalyticsSource =>
  typeof value === "string" &&
  (ANALYTICS_SOURCES as readonly string[]).includes(value);

// Agrega ?mk_source=<fuente> a una URL pública (compartir/copiar/QR).
export const withSourceParam = (url: string, source: AnalyticsSource): string => {
  const parsed = new URL(url);
  parsed.searchParams.set(SOURCE_PARAM, source);
  return parsed.toString();
};

// Quita mk_source de la URL visible sin recargar ni tocar el estado del router.
const stripSourceParam = () => {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(SOURCE_PARAM)) return;
    url.searchParams.delete(SOURCE_PARAM);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    /* opcional */
  }
};

// Solo una categoría general del referrer; nunca se guarda el referrer.
const categoryFromReferrer = (): AnalyticsSource => {
  try {
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    if (!referrer) return "direct";
    return new URL(referrer).host === window.location.host ? "direct" : "other";
  } catch {
    return "other";
  }
};

// Fuente de la sesión actual del negocio: mk_source válido (se persiste y se
// quita de la URL) > fuente ya guardada para la sesión > categoría del
// referrer (se persiste para que la navegación interna no la cambie).
export const resolveSource = (businessId: string): AnalyticsSource => {
  try {
    const param = new URLSearchParams(window.location.search).get(SOURCE_PARAM);
    if (param !== null) {
      stripSourceParam();
      if (isAnalyticsSource(param)) {
        storageSet(sourceKey(businessId), param);
        return param;
      }
    }
  } catch {
    /* sigue con lo guardado */
  }
  const stored = storageGet(sourceKey(businessId));
  if (isAnalyticsSource(stored)) return stored;
  const derived = categoryFromReferrer();
  storageSet(sourceKey(businessId), derived);
  return derived;
};
