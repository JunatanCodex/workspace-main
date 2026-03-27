import { stat } from "node:fs/promises";
import path from "node:path";
import type { DiscordBotRegistryEntry } from "@/lib/discord-bots/types";

export async function inferBotHealth(
  bot: DiscordBotRegistryEntry,
  workspaceRoot: string,
  options?: { serviceActive?: boolean },
): Promise<{ status: string; health_score: number; summary: string }> {
  const botRoot = path.join(workspaceRoot, bot.bot_id);
  const now = Date.now();
  let score = 100;
  let summary = "Healthy baseline not yet verified.";

  if (bot.status === "failed" && !options?.serviceActive) score -= 35;
  if (bot.status === "degraded") score -= 20;
  score -= Math.min(bot.restart_count * 3, 18);

  if (bot.last_healthy_at) {
    const ageHours = (now - new Date(bot.last_healthy_at).getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) score -= 10;
    if (ageHours > 72) score -= 10;
    summary = `Last healthy ${Math.round(ageHours)}h ago.`;
  } else if (!options?.serviceActive) {
    score -= 8;
  }

  let freshRuntime = false;
  try {
    const runtimeMarker = await stat(path.join(botRoot, ".runtime-ok"));
    const ageMinutes = (now - runtimeMarker.mtime.getTime()) / (1000 * 60);
    if (ageMinutes < 90) {
      freshRuntime = true;
      summary = `Runtime marker updated ${Math.round(ageMinutes)}m ago.`;
    } else {
      score -= 10;
      summary = `Runtime marker stale at ${Math.round(ageMinutes)}m.`;
    }
  } catch {
    score -= options?.serviceActive ? 0 : 10;
  }

  if (options?.serviceActive) {
    score += 20;
    if (freshRuntime) score += 10;
    summary = freshRuntime ? `${summary} Supervised service is active.` : "Supervised service is active.";
  }

  score = Math.max(0, Math.min(100, score));
  const status = bot.status === "stopped" ? "stopped" : score >= 80 ? "healthy" : score >= 55 ? "degraded" : "failed";
  return { status, health_score: score, summary };
}
