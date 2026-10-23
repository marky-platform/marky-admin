import { isUuid, randomUuid } from "./identity";
import { storageGet, storageRemove, storageSet } from "./storage";

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

const normalize = (businessId: string) => businessId.trim().toLowerCase();

export const sessionKey = (businessId: string) =>
  `marky.analytics.session.${normalize(businessId)}`;
export const lastActivityKey = (businessId: string) =>
  `marky.analytics.last_activity.${normalize(businessId)}`;
export const sourceKey = (businessId: string) =>
  `marky.analytics.source.${normalize(businessId)}`;
export const visitSentKey = (businessId: string) =>
  `marky.analytics.visit_sent.${normalize(businessId)}`;

const isVisible = () =>
  typeof document === "undefined" || document.visibilityState === "visible";

// Devuelve la sesión vigente del negocio y la renueva si pasaron más de 30
// minutos desde la última actividad. La actividad solo se actualiza mientras
// la pestaña está visible. La lectura es siempre fresca de localStorage, así
// que las pestañas comparten el mismo estado sin cachés propias que
// diverjan.
export const resolveSession = (
  businessId: string,
  now: number = Date.now(),
): { sessionId: string; isNew: boolean } => {
  const storedId = storageGet(sessionKey(businessId));
  const last = Number(storageGet(lastActivityKey(businessId)));
  const expired =
    !Number.isFinite(last) || last <= 0 || now - last > SESSION_TIMEOUT_MS;

  let sessionId: string;
  let isNew = false;
  if (isUuid(storedId) && !expired) {
    sessionId = storedId;
  } else {
    sessionId = randomUuid();
    isNew = true;
    storageSet(sessionKey(businessId), sessionId);
    // La fuente y la marca de visita pertenecen a la sesión anterior.
    storageRemove(sourceKey(businessId));
    storageRemove(visitSentKey(businessId));
    storageSet(lastActivityKey(businessId), String(now));
  }
  if (!isNew && isVisible()) {
    storageSet(lastActivityKey(businessId), String(now));
  }
  return { sessionId, isNew };
};
