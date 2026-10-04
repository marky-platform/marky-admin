// Interpreta un decimal escrito con coma o punto ("1,5" / "1.5") como número.
// Devuelve null si el texto está vacío o es malformado (letras, signos,
// más de un separador). No valida positividad: eso es responsabilidad del
// llamador (0 es un valor parseable y distinto de null).
export const parseLocaleDecimal = (raw: string | number | null | undefined): number | null => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const text = raw.trim();
  if (!/^\d+([.,]\d+)?$|^[.,]\d+$/.test(text)) return null;
  // "1.500" se lee como mil quinientos en es-PY (punto de miles), no como
  // 1,5: se rechaza para no guardar un valor distinto del que el usuario quiso.
  if (/^[1-9]\d{0,2}\.\d{3}$/.test(text)) return null;
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : null;
};

// Inverso para hidratar el formulario: usa la coma como separador (es-PY).
export const formatLocaleDecimal = (value: number | null | undefined): string =>
  value === null || value === undefined ? "" : String(value).replace(".", ",");
