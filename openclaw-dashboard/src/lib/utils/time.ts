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
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
