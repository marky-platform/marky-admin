const numberFormat = new Intl.NumberFormat("es");

export const formatCount = (value: number): string =>
  numberFormat.format(Number.isFinite(value) ? value : 0);

/** "45s" o "2m 5s". */
export const formatDuration = (totalSeconds: number): string => {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

/** "2026-10-17" -> fecha calendario fija (sin desfase por zona horaria). */
const parseCalendarDate = (date: string): Date =>
  new Date(`${date}T00:00:00Z`);

export const formatWeekdayShort = (date: string): string => {
  const d = parseCalendarDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(d)
    .replace(".", "");
};

export const formatDayMonth = (date: string): string => {
  const d = parseCalendarDate(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(d);
};

/** Última visita: "23 oct, 10:08" en la zona horaria del negocio. */
export const formatLastVisit = (iso: string, timeZone: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  try {
    return new Intl.DateTimeFormat("es", { ...opts, timeZone }).format(d);
  } catch {
    return new Intl.DateTimeFormat("es", opts).format(d);
  }
};

/** Alto relativo (0..1); seguro cuando el máximo es 0. */
export const barRatio = (value: number, max: number): number =>
  max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
