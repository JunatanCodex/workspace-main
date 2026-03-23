const DASHBOARD_TIME_ZONE = "Asia/Manila";
const DASHBOARD_LOCALE = "en-PH";

export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function hoursSince(value?: string): number | null {
  const date = parseDate(value);
  if (!date) return null;
  return (Date.now() - date.getTime()) / 1000 / 60 / 60;
}

export function formatDateTime(value?: string): string {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    timeZone: DASHBOARD_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTime(value?: string): string {
  const date = parseDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat(DASHBOARD_LOCALE, {
    timeZone: DASHBOARD_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function getManilaDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function formatCalendarDateTime(value?: string): string {
  const date = parseDate(value);
  if (!date) return "—";

  const now = new Date();
  const currentKey = getManilaDateParts(now);
  const targetKey = getManilaDateParts(date);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayKey = getManilaDateParts(yesterday);

  if (targetKey === currentKey) {
    return `Today, ${formatTime(value)}`;
  }

  if (targetKey === yesterdayKey) {
    return `Yesterday, ${formatTime(value)}`;
  }

  return formatDateTime(value);
}

export function formatRelative(value?: string): string {
  const date = parseDate(value);
  if (!date) return "No data";
  const diffMs = date.getTime() - Date.now();
  const mins = Math.round(diffMs / 1000 / 60);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 48) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

export function formatReadableTimestamp(value?: string): string {
  const dateTime = formatCalendarDateTime(value);
  if (dateTime === "—") return dateTime;
  return `${dateTime} (Asia/Manila)`;
}
