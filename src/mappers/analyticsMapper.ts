import { AnalyticsPulse, AnalyticsPulseResponse } from "../types/analytics";

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// Tolerante a secciones ausentes: un campo faltante se vuelve 0 / lista vacía
// en vez de romper todo el panel.
export const mapAnalyticsPulse = (
  raw: Partial<AnalyticsPulseResponse> | null | undefined,
): AnalyticsPulse => ({
  generatedAt: raw?.generated_at ?? "",
  timezone: raw?.timezone || "America/Asuncion",
  days: num(raw?.days) || (raw?.history?.length ?? 0),
  period: {
    start: raw?.period?.start ?? raw?.history?.[0]?.date ?? "",
    end: raw?.period?.end ?? raw?.history?.[raw.history.length - 1]?.date ?? "",
  },
  previous: {
    visits: num(raw?.previous?.visits),
    actions: num(raw?.previous?.actions),
  },
  today: {
    visits: num(raw?.today?.visits),
    uniqueVisitors: num(raw?.today?.unique_visitors),
    lastVisitAt: raw?.today?.last_visit_at ?? null,
  },
  history: (raw?.history ?? []).map((h) => ({
    date: h.date,
    visits: num(h.visits),
  })),
  sources: {
    publicLink: num(raw?.sources?.public_link),
    qr: num(raw?.sources?.qr),
    direct: num(raw?.sources?.direct),
    other: num(raw?.sources?.other),
  },
  actions: {
    location: num(raw?.actions?.location),
    whatsapp: num(raw?.actions?.whatsapp),
    instagram: num(raw?.actions?.instagram),
    other: num(raw?.actions?.other),
  },
  topProducts: (raw?.top_products ?? []).map((p) => ({
    productId: p.product_id ?? null,
    name: p.name,
    image: p.image || null,
    views: num(p.views),
    averageEngagedSeconds: num(p.average_engaged_seconds),
  })),
});
