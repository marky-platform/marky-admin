const numberFormat = new Intl.NumberFormat("es");

export const formatCount = (value: number): string =>
  numberFormat.format(Number.isFinite(value) ? value : 0);

/** "42 s" o "1 min 15 s" (tiempo promedio por producto). */
export const formatSeconds = (totalSeconds: number): string => {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  if (s < 60) return `${s} s`;
  const rest = s % 60;
  return rest ? `${Math.floor(s / 60)} min ${rest} s` : `${Math.floor(s / 60)} min`;
};

/** Porcentaje entero de `part` sobre `total`; 0 si no hay total. */
export const sharePercent = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100) : 0;

/** "2026-10-17" -> fecha calendario fija (sin desfase por zona horaria). */
const parseCalendarDate = (date: string): Date => new Date(`${date}T00:00:00Z`);

const calendarPart = (date: string, opts: Intl.DateTimeFormatOptions) => {
  const d = parseCalendarDate(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es", { ...opts, timeZone: "UTC" }).format(d);
};

// Iniciales como en Figma (martes y miércoles = "M"; Intl usa "X" para miércoles).
const WEEKDAY_INITIALS = ["D", "L", "M", "M", "J", "V", "S"];

/** Inicial del día de la semana: "L", "M", "J"… */
export const weekdayInitial = (date: string): string => {
  const d = parseCalendarDate(date);
  return Number.isNaN(d.getTime()) ? "" : WEEKDAY_INITIALS[d.getUTCDay()];
};

/** "18–24 de septiembre" o "28 de septiembre – 4 de octubre". */
export const formatPeriodRange = (start: string, end: string): string => {
  if (!start || !end) return "";
  const [startDay, endDay] = [start, end].map((d) => calendarPart(d, { day: "numeric" }));
  const [startMonth, endMonth] = [start, end].map((d) => calendarPart(d, { month: "long" }));
  if (startMonth === endMonth) return `${startDay}–${endDay} de ${endMonth}`;
  return `${startDay} de ${startMonth} – ${endDay} de ${endMonth}`;
};

const inTimeZone = (opts: Intl.DateTimeFormatOptions, timeZone: string) => {
  try {
    return new Intl.DateTimeFormat("es", { ...opts, timeZone });
  } catch {
    return new Intl.DateTimeFormat("es", opts);
  }
};

/** Hora "17:50" en la zona horaria del negocio. */
export const formatClock = (iso: string, timeZone: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return inTimeZone({ hour: "2-digit", minute: "2-digit", hour12: false }, timeZone).format(d);
};

const relative = new Intl.RelativeTimeFormat("es", { style: "short", numeric: "auto" });

/** "hace 12 min", "hace 3 h", "hace 2 días" respecto de `now`. */
export const formatTimeAgo = (iso: string, now: Date = new Date()): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const minutes = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 60_000));
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return relative.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return relative.format(-hours, "hour");
  return relative.format(-Math.floor(hours / 24), "day");
};

/** Alto relativo (0..1); seguro cuando el máximo es 0. */
export const barRatio = (value: number, max: number): number =>
  max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
