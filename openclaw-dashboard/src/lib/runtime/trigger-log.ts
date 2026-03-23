import path from "node:path";
import { promises as fs } from "node:fs";

const LOG_DIR = path.join(process.cwd(), "runtime-logs");

export async function appendTriggerLog(entry: Record<string, unknown>) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  const file = path.join(LOG_DIR, `${day}.jsonl`);
  await fs.appendFile(file, `${JSON.stringify(entry)}\n`, "utf8");
}
