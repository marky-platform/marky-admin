import { useSessionStore } from "../stores/sessionStore";
import { getVisitorId, randomUuid } from "./identity";
import { resolveSession, visitSentKey } from "./session";
import { resolveSource } from "./source";
import { storageGet, storageSet } from "./storage";
import type {
  AnalyticsBatchPayload,
  AnalyticsEventPayload,
  AnalyticsEventType,
  TrackOptions,
} from "./types";

// Cliente de eventos del catálogo público. Envía lotes pequeños como
// `text/plain;charset=UTF-8` (petición CORS "simple": sin preflight, así
// sobreviven al cierre de la página entre Vercel y Railway) con
// `fetch(keepalive)` o `navigator.sendBeacon`. Nunca usa el axios
// autenticado, nunca bloquea la navegación y falla en silencio.

export const CONTENT_TYPE = "text/plain;charset=UTF-8";
export const MAX_BATCH_SIZE = 20;
export const FLUSH_DELAY_MS = 1000;
export const MAX_ATTEMPTS = 4; // envío inicial + 3 reintentos
export const RETRY_DELAYS_MS = [2000, 5000, 15000];

const PRODUCT_EVENTS: AnalyticsEventType[] = [
  "product_open",
  "product_view",
  "product_engagement",
];

interface QueuedEvent {
  businessId: string;
  payload: AnalyticsEventPayload;
  attempts: number;
  notBefore: number;
}

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushTimerAt = 0;
let listenersAttached = false;
let sentViews = new Set<string>();

// Interruptor global del despliegue gradual.
export const isAnalyticsEnabled = (): boolean =>
  process.env.REACT_APP_ANALYTICS_ENABLED === "true";

// El tracker no cuenta nada si el navegador tiene una sesión de comerciante
// (tráfico propio) ni si está deshabilitado.
export const isTrackingActive = (): boolean => {
  if (!isAnalyticsEnabled()) return false;
  try {
    return !useSessionStore.getState().accessToken;
  } catch {
    return false;
  }
};

const endpointFor = (businessId: string) =>
  `${process.env.REACT_APP_API_URL}/public/business/${encodeURIComponent(
    businessId,
  )}/analytics/events/`;

const drop = (items: QueuedEvent[]) => {
  queue = queue.filter((q) => !items.includes(q));
};

const scheduleFlush = () => {
  if (queue.length === 0) return;
  const due = Math.min(...queue.map((q) => q.notBefore));
  if (flushTimer && flushTimerAt <= due) return;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimerAt = due;
  flushTimer = setTimeout(
    () => {
      flushTimer = null;
      flushTimerAt = 0;
      flush();
    },
    Math.max(0, due - Date.now()),
  );
};

const retryOrDrop = (items: QueuedEvent[]) => {
  const retryable = items
    .map((item) => ({ ...item, attempts: item.attempts + 1 }))
    .filter((item) => item.attempts < MAX_ATTEMPTS);
  const now = Date.now();
  retryable.forEach((item) => {
    item.notBefore =
      now + RETRY_DELAYS_MS[Math.min(item.attempts - 1, RETRY_DELAYS_MS.length - 1)];
  });
  // Conserva event_id: es el mismo payload, solo cambia el contador.
  queue = [...retryable, ...queue];
  scheduleFlush();
};

const sendBatch = (
  businessId: string,
  items: QueuedEvent[],
  useBeacon: boolean,
) => {
  const body = JSON.stringify({
    events: items.map((i) => i.payload),
  } as AnalyticsBatchPayload);
  const url = endpointFor(businessId);

  try {
    if (
      useBeacon &&
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function" &&
      navigator.sendBeacon(url, new Blob([body], { type: CONTENT_TYPE }))
    ) {
      return;
    }
  } catch {
    /* intenta con fetch */
  }

  const doFetch = typeof fetch === "function" ? fetch : undefined;
  if (!doFetch) return;
  try {
    doFetch(url, {
      method: "POST",
      body,
      keepalive: true,
      credentials: "omit",
      headers: { "Content-Type": CONTENT_TYPE },
    })
      .then((response) => {
        if (response.ok) return;
        // 400/404 (y el resto de 4xx definitivos) no se reintentan; sí los
        // temporales: 408, 429 y 5xx.
        const status = response.status;
        if (status === 408 || status === 429 || status >= 500) {
          retryOrDrop(items);
        }
      })
      .catch(() => retryOrDrop(items));
  } catch {
    retryOrDrop(items);
  }
};

// Envía lo pendiente. `beacon: true` (pagehide / pestaña oculta) ignora la
// espera de lotes y prefiere sendBeacon.
export const flush = (options: { beacon?: boolean } = {}): void => {
  try {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
      flushTimerAt = 0;
    }
    const now = Date.now();
    const ready = queue.filter((q) => options.beacon || q.notBefore <= now);
    if (ready.length === 0) {
      scheduleFlush();
      return;
    }
    drop(ready);
    const byBusiness = new Map<string, QueuedEvent[]>();
    ready.forEach((q) => {
      byBusiness.set(q.businessId, [...(byBusiness.get(q.businessId) ?? []), q]);
    });
    byBusiness.forEach((items, businessId) => {
      for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
        sendBatch(businessId, items.slice(i, i + MAX_BATCH_SIZE), !!options.beacon);
      }
    });
    scheduleFlush();
  } catch {
    /* el analytics nunca rompe la página */
  }
};

const attachListeners = () => {
  if (listenersAttached || typeof window === "undefined") return;
  listenersAttached = true;
  window.addEventListener("pagehide", () => flush({ beacon: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush({ beacon: true });
  });
};

export const track = (
  type: AnalyticsEventType,
  options: TrackOptions,
): string | null => {
  try {
    if (!isTrackingActive()) return null;
    const { businessId } = options;
    if (!businessId) return null;

    let productId: number | undefined;
    if (PRODUCT_EVENTS.includes(type)) {
      productId = Number(options.productId);
      if (!Number.isInteger(productId) || productId <= 0) return null;
    }

    const { sessionId, isNew } = resolveSession(businessId);

    // Si la sesión rotó a mitad de una página pública (p. ej. pestaña oculta
    // más de 30 min), la nueva sesión debe abrir con su catalog_visit para no
    // quedar sin visita ni origen. La marca visit_sent evita duplicados.
    if (isNew && type !== "catalog_visit") trackCatalogVisit(businessId);

    // Una vista válida por producto/sesión: evita tráfico repetido (el
    // backend es la fuente de verdad y también deduplica).
    if (type === "product_view") {
      const key = `${businessId.toLowerCase()}:${productId}:${sessionId}`;
      if (sentViews.has(key)) return null;
      sentViews.add(key);
    }

    const payload: AnalyticsEventPayload = {
      event_id: randomUuid(),
      visitor_id: getVisitorId(),
      session_id: sessionId,
      type,
      source: options.source ?? resolveSource(businessId),
      occurred_at: new Date().toISOString(),
    };
    if (productId !== undefined) payload.product_id = productId;
    if (type === "product_engagement") {
      payload.engaged_ms = Math.max(0, Math.round(options.engagedMs ?? 0));
    }
    if (type === "action_click") payload.action_type = options.actionType ?? "other";

    queue.push({
      businessId,
      payload,
      attempts: 0,
      notBefore: Date.now() + FLUSH_DELAY_MS,
    });
    attachListeners();
    scheduleFlush();
    return payload.event_id;
  } catch {
    return null;
  }
};

// catalog_visit una sola vez por negocio/sesión (la marca persiste, así un
// refresh dentro de la sesión no reenvía). La restricción de la base de datos
// sigue siendo la autoridad.
export const trackCatalogVisit = (businessId: string): string | null => {
  try {
    if (!isTrackingActive() || !businessId) return null;
    const { sessionId } = resolveSession(businessId);
    if (storageGet(visitSentKey(businessId)) === sessionId) return null;
    const id = track("catalog_visit", { businessId });
    if (id) storageSet(visitSentKey(businessId), sessionId);
    return id;
  } catch {
    return null;
  }
};

/** Solo para pruebas. */
export const resetAnalyticsClient = (): void => {
  queue = [];
  sentViews = new Set();
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  flushTimerAt = 0;
};

export const analytics = { track, trackCatalogVisit, flush };
export default analytics;
