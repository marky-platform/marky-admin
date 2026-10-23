import { AnalyticsPulseResponse } from "../../../../types/analytics";

export const pulseFixture: AnalyticsPulseResponse = {
  generated_at: "2026-10-23T13:10:00Z",
  timezone: "America/Asuncion",
  days: 7,
  period: { start: "2026-10-17", end: "2026-10-23" },
  previous: { visits: 49, actions: 12 },
  today: {
    visits: 14,
    unique_visitors: 11,
    last_visit_at: "2026-10-23T13:08:12Z",
  },
  history: [
    { date: "2026-10-17", visits: 0 },
    { date: "2026-10-18", visits: 8 },
    { date: "2026-10-19", visits: 4 },
    { date: "2026-10-20", visits: 10 },
    { date: "2026-10-21", visits: 2 },
    { date: "2026-10-22", visits: 6 },
    { date: "2026-10-23", visits: 14 },
  ],
  sources: { public_link: 18, qr: 6, direct: 2, other: 1 },
  actions: { location: 4, whatsapp: 9, instagram: 2, other: 3 },
  top_products: [
    { product_id: 123, name: "Pizza Margarita", image: "https://cdn.test/pizza.jpg", views: 12, average_engaged_seconds: 18 },
    { product_id: null, name: "Sushi viejo", image: null, views: 3, average_engaged_seconds: 75 },
  ],
};

export const emptyPulseFixture: AnalyticsPulseResponse = {
  ...pulseFixture,
  today: { visits: 0, unique_visitors: 0, last_visit_at: null },
  history: pulseFixture.history.map((h) => ({ ...h, visits: 0 })),
  previous: { visits: 0, actions: 0 },
  sources: { public_link: 0, qr: 0, direct: 0, other: 0 },
  actions: { location: 0, whatsapp: 0, instagram: 0, other: 0 },
  top_products: [],
};
