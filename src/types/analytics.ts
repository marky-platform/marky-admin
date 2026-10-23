// Contrato de GET /api/v1/business/analytics/pulse/?days=7 (congelado).
// Las fechas `date` son YYYY-MM-DD en la zona horaria del negocio
// (`timezone`); los instantes (`generated_at`, `last_visit_at`) son ISO UTC.

export interface AnalyticsPulseResponse {
  generated_at: string;
  timezone: string;
  today: {
    visits: number;
    unique_visitors: number;
    last_visit_at: string | null;
  };
  history: { date: string; visits: number }[];
  sources: {
    public_link: number;
    qr: number;
    direct: number;
    other: number;
  };
  actions: {
    location: number;
    whatsapp: number;
    instagram: number;
    other: number;
  };
  top_products: {
    product_id: number | null;
    name: string;
    views: number;
    average_engaged_seconds: number;
  }[];
}

export interface AnalyticsPulse {
  generatedAt: string;
  timezone: string;
  today: {
    visits: number;
    uniqueVisitors: number;
    lastVisitAt: string | null;
  };
  history: { date: string; visits: number }[];
  sources: { publicLink: number; qr: number; direct: number; other: number };
  actions: {
    location: number;
    whatsapp: number;
    instagram: number;
    other: number;
  };
  topProducts: {
    productId: number | null;
    name: string;
    views: number;
    averageEngagedSeconds: number;
  }[];
}
