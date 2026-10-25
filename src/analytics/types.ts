// Contrato del tracker público de analytics (primera parte). Los nombres y
// enums reflejan el endpoint de ingesta del backend:
//   POST /public/business/{business_id}/analytics/events/
// Es el contrato congelado del plan; no cambiar sin pasar por el coordinador.

export type AnalyticsEventType =
  | "catalog_visit"
  | "product_open"
  | "product_view"
  | "product_engagement"
  | "action_click";

export type AnalyticsSource = "public_link" | "qr";

export type AnalyticsActionType =
  | "location"
  | "whatsapp"
  | "instagram"
  | "other";

/** Un evento tal como viaja en el cuerpo del lote. */
export interface AnalyticsEventPayload {
  event_id: string;
  visitor_id: string;
  session_id: string;
  type: AnalyticsEventType;
  /** Obligatorio para product_open / product_view / product_engagement. */
  product_id?: number;
  source: AnalyticsSource;
  /** ISO 8601 (UTC). Solo diagnóstico/orden: el servidor usa received_at. */
  occurred_at: string;
  /** > 0 solo en product_engagement (máx. 30 000 por fragmento). */
  engaged_ms?: number;
  /** Solo en action_click. */
  action_type?: AnalyticsActionType | "";
}

/** Cuerpo del POST (máx. 20 eventos por lote). */
export interface AnalyticsBatchPayload {
  events: AnalyticsEventPayload[];
}

/** Opciones de `analytics.track`. */
export interface TrackOptions {
  businessId: string;
  productId?: number | string;
  actionType?: AnalyticsActionType;
  engagedMs?: number;
  /** Solo para pruebas/casos especiales; por defecto se resuelve la fuente. */
  source?: AnalyticsSource;
}
