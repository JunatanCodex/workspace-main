import path from "node:path";
import { promises as fs } from "node:fs";
import { hoursSince } from "@/lib/utils/time";

const LOG_DIR = path.join(process.cwd(), "runtime-logs");

export interface TriggerLogEntry {
  startedAt?: string;
  finishedAt?: string;
  agentId?: string;
  message?: string;
  ok?: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

export async function getTriggerLogs(): Promise<TriggerLogEntry[]> {
  try {
    const files = (await fs.readdir(LOG_DIR)).filter((name) => name.endsWith(".jsonl")).sort().reverse();
    const entries: TriggerLogEntry[] = [];
    for (const file of files.slice(0, 7)) {
      const raw = await fs.readFile(path.join(LOG_DIR, file), "utf8");
      for (const line of raw.split(/\r?\n/).filter(Boolean).reverse()) {
        try {
          entries.push(JSON.parse(line) as TriggerLogEntry);
        } catch {
          // Skip malformed lines; logs are best-effort operational artifacts.
        }
      }
    }
    return entries;
  } catch {
    return [];
  }
}

export async function getRecentAgentErrors(agentId: string, maxHours = 24): Promise<TriggerLogEntry[]> {
  const logs = await getTriggerLogs();
  return logs.filter((entry) => entry.agentId === agentId && entry.ok === false && (hoursSince(entry.startedAt) ?? Infinity) <= maxHours);
}
