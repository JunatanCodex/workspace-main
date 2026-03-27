import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

const AUDIT_FILE = path.join(AGENTS_ROOT, "discord-bot-ops", "logs", "audit.jsonl");

export interface DiscordAuditRecord {
  ts: string;
  kind: string;
  botId?: string;
  action?: string;
  deployment_id?: string;
  reason?: string;
  status?: string;
  health_score?: number;
  [key: string]: unknown;
}

export async function readDiscordAudit(limit = 200): Promise<DiscordAuditRecord[]> {
  try {
    const raw = await fs.readFile(AUDIT_FILE, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as DiscordAuditRecord)
      .reverse()
      .slice(0, limit);
  } catch {
    return [];
  }
}
