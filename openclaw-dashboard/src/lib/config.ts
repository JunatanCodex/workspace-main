import path from "node:path";

export const OPENCLAW_ROOT = process.env.OPENCLAW_HOME || "/home/jim/.openclaw";
export const AGENTS_ROOT = path.join(OPENCLAW_ROOT, "agents");
export const SHARED_ROOT = path.join(OPENCLAW_ROOT, "shared");
export const TASKS_FILE = path.join(SHARED_ROOT, "tasks.json");
export const ROUTING_FILE = path.join(SHARED_ROOT, "routing-map.json");
export const DIGEST_FILE = path.join(SHARED_ROOT, "digest.md");
export const OPENCLAW_CONFIG_FILE = path.join(OPENCLAW_ROOT, "openclaw.json");
export const LOGS_ROOT = path.join(OPENCLAW_ROOT, "logs");
export const CRON_JOBS_FILE = path.join(OPENCLAW_ROOT, "cron", "jobs.json");

export const STALLED_QUEUED_HOURS = 24;
export const STALLED_IN_PROGRESS_HOURS = 12;
export const OFFLINE_MULTIPLIER = 2;
