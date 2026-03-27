import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";

const STATE_FILE = path.join(AGENTS_ROOT, "discord-bot-ops", "retry-state.json");
const MAX_RETRIES = 3;
const COOLDOWN_MS = 30 * 60 * 1000;

type RetryState = Record<string, { count: number; lastFailureAt?: string; cooldownUntil?: string }>;

async function readState(): Promise<RetryState> {
  try {
    return JSON.parse(await fs.readFile(STATE_FILE, "utf8")) as RetryState;
  } catch {
    return {};
  }
}

async function writeState(state: RetryState) {
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function getRetryDecision(botId: string) {
  const state = await readState();
  const row = state[botId] || { count: 0 };
  const now = Date.now();
  const cooldownUntil = row.cooldownUntil ? new Date(row.cooldownUntil).getTime() : 0;
  return {
    count: row.count,
    blocked: cooldownUntil > now || row.count >= MAX_RETRIES,
    cooldownUntil: row.cooldownUntil,
    maxRetries: MAX_RETRIES,
  };
}

export async function markFailure(botId: string) {
  const state = await readState();
  const row = state[botId] || { count: 0 };
  const count = row.count + 1;
  state[botId] = {
    count,
    lastFailureAt: new Date().toISOString(),
    cooldownUntil: count >= MAX_RETRIES ? new Date(Date.now() + COOLDOWN_MS).toISOString() : row.cooldownUntil,
  };
  await writeState(state);
}

export async function markSuccess(botId: string) {
  const state = await readState();
  state[botId] = { count: 0 };
  await writeState(state);
}
