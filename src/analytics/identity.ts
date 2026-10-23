import { storageGet, storageSet } from "./storage";

export const VISITOR_KEY = "marky.analytics.visitor_id";

const HEX: string[] = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0"),
);

const bytesToUuid = (b: Uint8Array): string => {
  b[6] = (b[6] & 0x0f) | 0x40; // versión 4
  b[8] = (b[8] & 0x3f) | 0x80; // variante RFC 4122
  const h = Array.from(b, (x) => HEX[x]);
  return (
    h.slice(0, 4).join("") + "-" + h.slice(4, 6).join("") + "-" +
    h.slice(6, 8).join("") + "-" + h.slice(8, 10).join("") + "-" +
    h.slice(10, 16).join("")
  );
};

// UUID v4 aleatorio. Prefiere crypto.randomUUID; si no existe usa
// getRandomValues y, como último recurso, Math.random. Nunca deriva el valor
// de características del dispositivo (sin fingerprinting).
export const randomUuid = (): string => {
  try {
    const c = typeof crypto !== "undefined" ? crypto : undefined;
    if (c && typeof c.randomUUID === "function") return c.randomUUID();
    if (c && typeof c.getRandomValues === "function") {
      return bytesToUuid(c.getRandomValues(new Uint8Array(16)));
    }
  } catch {
    /* cae a Math.random */
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return bytesToUuid(bytes);
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_RE.test(value);

// Identificador anónimo del navegador, compartido entre negocios y persistente.
export const getVisitorId = (): string => {
  const stored = storageGet(VISITOR_KEY);
  if (isUuid(stored)) return stored;
  const created = randomUuid();
  storageSet(VISITOR_KEY, created);
  return created;
};
