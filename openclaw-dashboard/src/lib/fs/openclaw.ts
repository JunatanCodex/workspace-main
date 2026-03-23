import { OPENCLAW_CONFIG_FILE, CRON_JOBS_FILE } from "@/lib/config";
import type { AgentConfig } from "@/lib/types";
import { readJsonIfExists } from "./safe-read";

interface OpenClawConfig {
  agents?: {
    list?: AgentConfig[];
    defaults?: {
      heartbeat?: { every?: string };
    };
  };
}

export async function getOpenClawConfig(): Promise<OpenClawConfig> {
  return readJsonIfExists<OpenClawConfig>(OPENCLAW_CONFIG_FILE, {});
}

export async function getRegisteredAgents(): Promise<AgentConfig[]> {
  const config = await getOpenClawConfig();
  return config.agents?.list || [];
}

export async function getCronJobs(): Promise<unknown[]> {
  const json = await readJsonIfExists<{ jobs?: unknown[] } | unknown[]>(CRON_JOBS_FILE, []);
  if (Array.isArray(json)) return json;
  return Array.isArray(json.jobs) ? json.jobs : [];
}
