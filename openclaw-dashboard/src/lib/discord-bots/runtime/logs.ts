import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, "discord-bot-ops");
const LOGS_ROOT = path.join(BOT_OPS_ROOT, "logs");

export async function appendBotLog(botId: string, kind: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  await fs.mkdir(LOGS_ROOT, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  const file = path.join(LOGS_ROOT, `${botId}-${day}.jsonl`);
  await fs.appendFile(file, `${JSON.stringify({ ts: new Date().toISOString(), botId, kind, message, meta })}\n`, "utf8");
}

export async function readRecentBotLogs(botId: string, limit = 200): Promise<string[]> {
  try {
    const entries = (await fs.readdir(LOGS_ROOT)).filter((name) => name.startsWith(`${botId}-`) && name.endsWith(".jsonl")).sort().reverse();
    const lines: string[] = [];
    for (const entry of entries) {
      const raw = await fs.readFile(path.join(LOGS_ROOT, entry), "utf8");
      const fileLines = raw.trim().split("\n").filter(Boolean).reverse();
      for (const line of fileLines) {
        lines.push(line);
        if (lines.length >= limit) return lines.reverse();
      }
    }
    return lines.reverse();
  } catch {
    return [];
  }
}
