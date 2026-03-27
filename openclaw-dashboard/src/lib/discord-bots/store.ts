import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT } from "@/lib/config";
import { readJsonIfExists, readTextIfExists } from "@/lib/fs/safe-read";
import type {
  DiscordBotRegistryEntry,
  DiscordBotSecretRecord,
  DiscordBotView,
  DiscordDeploymentRecord,
  DiscordIncidentRecord,
  DiscordHealthReport,
} from "./types";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, "discord-bot-ops");
const REGISTRY_FILE = path.join(BOT_OPS_ROOT, "bot-registry.json");
const SECRETS_FILE = path.join(BOT_OPS_ROOT, "bot-secrets.json");
const DEPLOYMENTS_DIR = path.join(BOT_OPS_ROOT, "deployments");
const INCIDENTS_DIR = path.join(BOT_OPS_ROOT, "incidents");
const HEALTH_FILE = path.join(BOT_OPS_ROOT, "health-report.json");
const DEPLOYMENT_SUMMARY_FILE = path.join(BOT_OPS_ROOT, "deployment-summary.md");
const INCIDENT_SUMMARY_FILE = path.join(BOT_OPS_ROOT, "incident-summary.md");

async function listJsonRecords<T>(dir: string): Promise<T[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const items = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          try {
            const raw = await fs.readFile(path.join(dir, entry.name), "utf8");
            return JSON.parse(raw) as unknown;
          } catch {
            return null;
          }
        }),
    );
    return items.filter((item) => item !== null) as T[];
  } catch {
    return [];
  }
}

export async function getDiscordBotRegistry(): Promise<DiscordBotRegistryEntry[]> {
  const rows = await readJsonIfExists<DiscordBotRegistryEntry[]>(REGISTRY_FILE, []);
  return Array.isArray(rows) ? rows : [];
}

export async function saveDiscordBotRegistry(rows: DiscordBotRegistryEntry[]): Promise<void> {
  await fs.writeFile(REGISTRY_FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export async function getDiscordBotSecrets(): Promise<Record<string, DiscordBotSecretRecord>> {
  const json = await readJsonIfExists<Record<string, DiscordBotSecretRecord>>(SECRETS_FILE, {});
  return json && typeof json === "object" ? json : {};
}

export async function saveDiscordBotSecrets(rows: Record<string, DiscordBotSecretRecord>): Promise<void> {
  await fs.writeFile(SECRETS_FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

export async function getDiscordDeployments(): Promise<DiscordDeploymentRecord[]> {
  const rows = await listJsonRecords<DiscordDeploymentRecord>(DEPLOYMENTS_DIR);
  return rows.sort((a, b) => String(b.started_at || "").localeCompare(String(a.started_at || "")));
}

export async function getDiscordIncidents(): Promise<DiscordIncidentRecord[]> {
  const rows = await listJsonRecords<DiscordIncidentRecord>(INCIDENTS_DIR);
  return rows.sort((a, b) => String(b.detected_at || "").localeCompare(String(a.detected_at || "")));
}

export async function saveDiscordDeployment(record: DiscordDeploymentRecord): Promise<void> {
  await fs.mkdir(DEPLOYMENTS_DIR, { recursive: true });
  await fs.writeFile(path.join(DEPLOYMENTS_DIR, `${record.deployment_id}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

export async function saveDiscordIncident(record: DiscordIncidentRecord): Promise<void> {
  await fs.mkdir(INCIDENTS_DIR, { recursive: true });
  await fs.writeFile(path.join(INCIDENTS_DIR, `${record.incident_id}.json`), `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

export async function getDiscordHealthReport(): Promise<DiscordHealthReport> {
  return readJsonIfExists<DiscordHealthReport>(HEALTH_FILE, { updatedAt: null, bots: [] });
}

export async function saveDiscordHealthReport(report: DiscordHealthReport): Promise<void> {
  await fs.writeFile(HEALTH_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

export async function getDiscordSummaryFiles(): Promise<{ deploymentSummary: string; incidentSummary: string }> {
  const [deploymentSummary, incidentSummary] = await Promise.all([
    readTextIfExists(DEPLOYMENT_SUMMARY_FILE),
    readTextIfExists(INCIDENT_SUMMARY_FILE),
  ]);
  return { deploymentSummary: deploymentSummary || "", incidentSummary: incidentSummary || "" };
}

export async function getDiscordBotViews(): Promise<DiscordBotView[]> {
  const [registry, secrets, deployments, incidents] = await Promise.all([
    getDiscordBotRegistry(),
    getDiscordBotSecrets(),
    getDiscordDeployments(),
    getDiscordIncidents(),
  ]);

  return registry.map((bot) => {
    const botDeployments = deployments.filter((item) => item.bot_id === bot.bot_id);
    const botIncidents = incidents.filter((item) => item.bot_id === bot.bot_id);
    const secretRecord = secrets[bot.bot_id] || {};
    const configuredNames = new Set([
      ...(secretRecord.DISCORD_TOKEN ? ["DISCORD_TOKEN"] : []),
      ...(secretRecord.CLIENT_ID ? ["CLIENT_ID"] : []),
      ...(secretRecord.GUILD_ID ? ["GUILD_ID"] : []),
      ...Object.keys(secretRecord.additional_env || {}),
    ]);

    return {
      ...bot,
      masked_env: bot.env_var_names.map((name) => ({ name, configured: configuredNames.has(name) })),
      deployment_count: botDeployments.length,
      incident_count: botIncidents.length,
      last_deployment: botDeployments[0],
      last_incident: botIncidents[0],
      available_actions: ["start", "stop", "restart", "redeploy", "pull-latest", ...(bot.rollback_enabled ? ["rollback"] : []), "open-console"],
      uptime_label: bot.last_healthy_at ? `Healthy since ${new Date(bot.last_healthy_at).toLocaleString()}` : "No healthy runtime recorded yet",
    } satisfies DiscordBotView;
  });
}

export async function getDiscordBotById(botId: string): Promise<DiscordBotView | null> {
  const rows = await getDiscordBotViews();
  return rows.find((row) => row.bot_id === botId) || null;
}
