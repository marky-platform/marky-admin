import { useEffect, useRef } from "react";
import { analytics } from "./client";

export const VIEW_THRESHOLD_MS = 3000;
export const ENGAGEMENT_CHUNK_MS = 15000;
export const MAX_CHUNK_MS = 30000;

const isVisible = () => document.visibilityState === "visible";

// catalog_visit una vez por negocio/sesión cuando hay un perfil válido.
export const useCatalogVisit = (businessId: string | undefined, ready: boolean) => {
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
    let unsentMs = 0; // tiempo visible aún no enviado
    let viewConfirmed = false;
    let viewTimer: ReturnType<typeof setTimeout> | null = null;
    let chunkTimer: ReturnType<typeof setInterval> | null = null;

    const clearTimers = () => {
      if (viewTimer) clearTimeout(viewTimer);
      if (chunkTimer) clearInterval(chunkTimer);
      viewTimer = null;
      chunkTimer = null;
    };

    const accumulate = () => {
      if (visibleSince !== null) {
        unsentMs += Math.max(0, Date.now() - visibleSince);
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

    const startVisible = () => {
      if (visibleSince !== null) return;
      visibleSince = Date.now();
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
      }, ENGAGEMENT_CHUNK_MS);
    };

    const stopVisible = (beacon: boolean) => {
      clearTimers();
      accumulate();
      visibleSince = null;
      sendChunks();
      analytics.flush({ beacon });
    };

    const onVisibility = () => {
      if (isVisible()) startVisible();
      else if (visibleSince !== null) stopVisible(true);
    };
    const onPageHide = () => {
      if (visibleSince !== null) stopVisible(true);
    };

    if (isVisible()) startVisible();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      if (visibleSince !== null) stopVisible(false);
      else clearTimers();
    };
  }, [businessId, productId]);
};
