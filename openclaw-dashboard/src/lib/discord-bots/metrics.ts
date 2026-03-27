import { getDiscordDeployments, getDiscordHealthReport, getDiscordIncidents } from "./store";

export interface DiscordTrendPoint {
  label: string;
  deployments: number;
  incidents: number;
}

export async function getDiscordTrendHistory(limitDays = 14): Promise<{ points: DiscordTrendPoint[]; currentHealthUpdatedAt?: string | null }> {
  const [deployments, incidents, health] = await Promise.all([getDiscordDeployments(), getDiscordIncidents(), getDiscordHealthReport()]);
  const byDay = new Map<string, DiscordTrendPoint>();

  function ensure(day: string) {
    if (!byDay.has(day)) byDay.set(day, { label: day, deployments: 0, incidents: 0 });
    return byDay.get(day)!;
  }

  for (const row of deployments) {
    const day = String(row.started_at || "").slice(0, 10);
    if (!day) continue;
    ensure(day).deployments += 1;
  }
  for (const row of incidents) {
    const day = String(row.detected_at || "").slice(0, 10);
    if (!day) continue;
    ensure(day).incidents += 1;
  }

  const points = Array.from(byDay.values()).sort((a, b) => a.label.localeCompare(b.label)).slice(-limitDays);
  return { points, currentHealthUpdatedAt: health.updatedAt };
}
