import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

const LOCK_DIR = path.join(AGENTS_ROOT, "discord-bot-ops", "locks");
const STALE_MS = 30 * 60 * 1000;

function lockPath(botId: string) {
  return path.join(LOCK_DIR, `${botId}.json`);
}

export async function acquireBotLock(botId: string, action: string): Promise<{ ok: boolean; reason?: string }> {
  await fs.mkdir(LOCK_DIR, { recursive: true });
  const file = lockPath(botId);
  try {
    const raw = await fs.readFile(file, "utf8");
    const data = JSON.parse(raw) as { startedAt?: string; action?: string };
    const startedAt = data.startedAt ? new Date(data.startedAt).getTime() : 0;
    if (startedAt && Date.now() - startedAt < STALE_MS) {
      return { ok: false, reason: `Another ${data.action || 'bot'} action is already running for this bot.` };
    }
  } catch {}
  await fs.writeFile(file, JSON.stringify({ botId, action, startedAt: new Date().toISOString() }, null, 2), "utf8");
  return { ok: true };
}

export async function releaseBotLock(botId: string) {
  await fs.rm(lockPath(botId), { force: true });
}
