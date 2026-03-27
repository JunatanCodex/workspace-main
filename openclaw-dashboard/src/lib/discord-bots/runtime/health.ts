import { stat } from "node:fs/promises";
import path from "node:path";
import type { DiscordBotRegistryEntry } from "@/lib/discord-bots/types";

export async function inferBotHealth(bot: DiscordBotRegistryEntry, workspaceRoot: string): Promise<{ status: string; health_score: number; summary: string }> {
  const botRoot = path.join(workspaceRoot, bot.bot_id);
  const now = Date.now();
  let score = 100;
  let summary = "Healthy baseline not yet verified.";

  if (bot.status === "failed") score -= 50;
  if (bot.status === "degraded") score -= 25;
  score -= Math.min(bot.restart_count * 5, 30);

  if (bot.last_healthy_at) {
    const ageHours = (now - new Date(bot.last_healthy_at).getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) score -= 15;
    if (ageHours > 72) score -= 10;
    summary = `Last healthy ${Math.round(ageHours)}h ago.`;
  } else {
    score -= 10;
  }

  try {
    const runtimeMarker = await stat(path.join(botRoot, ".runtime-ok"));
    const ageMinutes = (now - runtimeMarker.mtime.getTime()) / (1000 * 60);
    if (ageMinutes < 90) {
      summary = `Runtime marker updated ${Math.round(ageMinutes)}m ago.`;
    } else {
      score -= 10;
      summary = `Runtime marker stale at ${Math.round(ageMinutes)}m.`;
    }
  } catch {
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 85 ? "healthy" : score >= 60 ? "degraded" : bot.status === "stopped" ? "stopped" : "failed";
  return { status, health_score: score, summary };
}
