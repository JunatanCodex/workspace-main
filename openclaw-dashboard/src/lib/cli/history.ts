import path from "node:path";
import { promises as fs } from "node:fs";

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
