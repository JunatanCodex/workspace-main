import path from "node:path";
import { promises as fs } from "node:fs";
import { getCurrentSession } from "@/lib/auth/session";
import { getCliAuditLogs } from "@/lib/db/cli-audit-logs";

const HISTORY_DIR = path.join(process.cwd(), "runtime-logs");
const HISTORY_FILE = path.join(HISTORY_DIR, "cli-history.jsonl");

export interface CliExecutionRecord {
  id: string;
  commandId: string;
  label: string;
  support: string;
  ok: boolean;
  timestamp: string;
  durationMs?: number;
  stdout?: string;
  stderr?: string;
  note?: string;
}

export async function appendCliHistory(record: CliExecutionRecord) {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
  await fs.appendFile(HISTORY_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

export async function readCliHistory(limit = 50): Promise<CliExecutionRecord[]> {
  const session = await getCurrentSession();
  if (session.profile && (session.profile.role === "admin" || session.profile.role === "owner")) {
    const dbLogs = await getCliAuditLogs(session.profile.role);
    if (dbLogs.length > 0) return dbLogs.slice(0, limit);
  }

  try {
    const raw = await fs.readFile(HISTORY_FILE, "utf8");
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as CliExecutionRecord)
      .reverse()
      .slice(0, limit);
  } catch {
    return [];
  }
}
