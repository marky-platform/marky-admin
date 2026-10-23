import { useEffect, useRef } from "react";
import { analytics, isTrackingActive } from "./client";
import { touchSessionActivity } from "./session";

export const VIEW_THRESHOLD_MS = 3000;
export const ENGAGEMENT_CHUNK_MS = 15000;
export const MAX_CHUNK_MS = 30000;
// Sin input durante este tiempo, la pestaña visible se considera inactiva.
export const IDLE_TIMEOUT_MS = 60_000;
// Tope de tiempo activo contabilizado por vista de producto.
export const MAX_ENGAGED_MS = 10 * 60 * 1000;
export const INPUT_THROTTLE_MS = 1000;
export const SESSION_TOUCH_THROTTLE_MS = 15_000;

const isVisible = () => document.visibilityState === "visible";

const INPUT_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];

// Mantiene viva la sesión mientras el visitante navega con la pestaña visible,
// sin emitir eventos. Respeta el no-op de comerciante y el interruptor global.
export const useSessionActivity = (businessId: string | undefined) => {
  useEffect(() => {
    if (!businessId) return;
    const biz: string = businessId;
    let last = 0;
    const onInput = () => {
      if (!isVisible()) return;
      const now = Date.now();
      if (now - last < SESSION_TOUCH_THROTTLE_MS) return;
      last = now;
      if (isTrackingActive()) touchSessionActivity(biz, now);
    };
    INPUT_EVENTS.forEach((n) =>
      window.addEventListener(n, onInput, { passive: true, capture: true }),
    );
    return () => {
      INPUT_EVENTS.forEach((n) =>
        window.removeEventListener(n, onInput, { capture: true }),
      );
    };
  }, [businessId]);
};

// catalog_visit una vez por negocio/sesión cuando hay un perfil válido.
export const useCatalogVisit = (businessId: string | undefined, ready: boolean) => {
  useSessionActivity(ready ? businessId : undefined);
  useEffect(() => {
    if (!ready || !businessId) return;
    analytics.trackCatalogVisit(businessId);
  }, [businessId, ready]);
};

// Instrumenta un detalle de producto público: visita (deep link), apertura,
// vista válida tras 3 s visibles continuos y tiempo activo en fragmentos.
export const useProductAnalytics = (
  businessId: string | undefined,
  productId: number | string | undefined,
) => {
  const openedFor = useRef<string | null>(null);
  useSessionActivity(businessId);

  useEffect(() => {
    if (!businessId || productId === undefined || productId === null) return;
    const biz: string = businessId;
    const pid = productId;

    analytics.trackCatalogVisit(biz);
    // Guarda contra el doble montaje de StrictMode en desarrollo.
    const openKey = `${biz}:${pid}`;
    if (openedFor.current !== openKey) {
      openedFor.current = openKey;
      analytics.track("product_open", { businessId: biz, productId: pid });
    }

    let visibleSince: number | null = null;
    let unsentMs = 0; // tiempo activo aún no enviado
    let totalMs = 0; // tiempo activo acumulado de esta vista (tope 10 min)
    let viewConfirmed = false;
    let blurred = false;
    let idle = false;
    let lastInputAt = 0;
    let viewTimer: ReturnType<typeof setTimeout> | null = null;
    let chunkTimer: ReturnType<typeof setInterval> | null = null;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (viewTimer) clearTimeout(viewTimer);
      if (chunkTimer) clearInterval(chunkTimer);
      if (idleTimer) clearTimeout(idleTimer);
      viewTimer = null;
      chunkTimer = null;
      idleTimer = null;
    };

    const accumulate = () => {
      if (visibleSince !== null) {
        const elapsed = Math.max(0, Date.now() - visibleSince);
        const add = Math.min(elapsed, MAX_ENGAGED_MS - totalMs);
        unsentMs += add;
        totalMs += add;
        visibleSince = Date.now();
      }
    };

    // Solo se envía tiempo de una vista confirmada.
    const sendChunks = () => {
      if (!viewConfirmed) return;
      while (unsentMs >= 1) {
        const chunk = Math.min(unsentMs, MAX_CHUNK_MS);
        unsentMs -= chunk;
        analytics.track("product_engagement", {
          businessId: biz,
          productId: pid,
          engagedMs: chunk,
        });
      }
    };

    const armIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        idleTimer = null;
        idle = true;
        evaluate(false);
      }, IDLE_TIMEOUT_MS);
    };

    const startActive = () => {
      if (visibleSince !== null) return;
      visibleSince = Date.now();
      armIdle();
      if (!viewConfirmed) {
        viewTimer = setTimeout(() => {
          viewTimer = null;
          viewConfirmed = true;
          analytics.track("product_view", { businessId: biz, productId: pid });
          accumulate();
        }, VIEW_THRESHOLD_MS);
      }
      chunkTimer = setInterval(() => {
        accumulate();
        sendChunks();
        if (totalMs >= MAX_ENGAGED_MS) evaluate(false);
      }, ENGAGEMENT_CHUNK_MS);
    };

    const stopActive = (beacon: boolean) => {
      clearTimers();
      accumulate();
      visibleSince = null;
      // Una vista pendiente cancelada no deja tiempo para una vista futura.
      if (!viewConfirmed) {
        unsentMs = 0;
        totalMs = 0;
      }
      sendChunks();
      analytics.flush({ beacon });
    };

    // Activo = pestaña visible, ventana con foco, con input reciente y bajo el tope.
    const evaluate = (beacon: boolean) => {
      const shouldRun =
        isVisible() && !blurred && !idle && totalMs < MAX_ENGAGED_MS;
      if (shouldRun) startActive();
      else if (visibleSince !== null) stopActive(beacon);
    };

    const onVisibility = () => evaluate(true);
    const onPageHide = () => {
      if (visibleSince !== null) stopActive(true);
    };
    // Restauración desde bfcache: pagehide detuvo el conteo; se reinicia.
    const onPageShow = (e: Event) => {
      if (!(e as PageTransitionEvent).persisted) return;
      blurred = false;
      idle = false;
      evaluate(false);
    };
    const onBlur = () => {
      blurred = true;
      evaluate(false);
    };
    const onFocus = () => {
      blurred = false;
      evaluate(false);
    };
    const onInput = () => {
      if (idle) {
        idle = false;
        lastInputAt = Date.now();
        evaluate(false);
        return;
      }
      const now = Date.now();
      if (now - lastInputAt < INPUT_THROTTLE_MS) return;
      lastInputAt = now;
      if (visibleSince !== null) armIdle();
    };

    evaluate(false);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    INPUT_EVENTS.forEach((n) =>
      window.addEventListener(n, onInput, { passive: true, capture: true }),
    );

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      INPUT_EVENTS.forEach((n) =>
        window.removeEventListener(n, onInput, { capture: true }),
      );
      if (visibleSince !== null) stopActive(false);
      else clearTimers();
    };
  }, [businessId, productId]);
};
