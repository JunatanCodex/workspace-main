import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

const AUDIT_FILE = path.join(AGENTS_ROOT, "discord-bot-ops", "logs", "audit.jsonl");

export async function appendAudit(entry: Record<string, unknown>) {
  await fs.mkdir(path.dirname(AUDIT_FILE), { recursive: true });
  await fs.appendFile(AUDIT_FILE, `${JSON.stringify({ ts: new Date().toISOString(), ...entry })}\n`, "utf8");
}
