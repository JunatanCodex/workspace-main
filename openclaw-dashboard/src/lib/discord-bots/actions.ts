import { promises as fs } from "node:fs";
import path from "node:path";
import { AGENTS_ROOT, TASKS_FILE } from "@/lib/config";
import { getTasks, saveTasks } from "@/lib/fs/tasks";
import type { TaskRecord } from "@/lib/types";
import {
  getDiscordBotRegistry,
  getDiscordBotSecrets,
  saveDiscordBotRegistry,
  saveDiscordBotSecrets,
  saveDiscordDeployment,
  saveDiscordHealthReport,
} from "./store";
import { DISCORD_BOT_TEMPLATES } from "./templates";
import { normalizeBotId, validateCommandSet, validateRepoUrl } from "./validation";
import type { DiscordBotRegistryEntry, DiscordDeploymentRecord } from "./types";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, "discord-bot-ops");
const BOT_WORKSPACE_ROOT = path.join(BOT_OPS_ROOT, "workspace", "bots");

function nowIso() {
  return new Date().toISOString();
}

function createTask(task: TaskRecord): TaskRecord {
  return task;
}

async function ensureBotWorkspace(botId: string): Promise<string> {
  const dir = path.join(BOT_WORKSPACE_ROOT, botId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function appendTask(task: TaskRecord): Promise<void> {
  const tasks = await getTasks();
  tasks.push(createTask(task));
  await saveTasks(tasks);
}

function hasActiveDuplicate(tasks: TaskRecord[], botId: string, action: string): boolean {
  return tasks.some((task) => {
    const status = String(task.status || "queued");
    if (["done", "cancelled", "failed", "error"].includes(status)) return false;
    const context = (task.context || {}) as Record<string, unknown>;
    return task.owner === "discord-bot-ops" && context.bot_id === botId && context.action === action;
  });
}

export async function registerDiscordBot(input: {
  name: string;
  repo_url: string;
  branch: string;
  runtime_type: string;
  working_directory: string;
  install: string;
  build: string;
  start: string;
  healthCheck: string;
  discordToken?: string;
  clientId?: string;
  guildId?: string;
  additionalEnv?: Record<string, string>;
  autoFixEnabled: boolean;
  restartPolicy: string;
  rollbackEnabled: boolean;
  template?: string;
}): Promise<{ ok: boolean; bot_id?: string; errors?: string[] }> {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Bot name is required.");
  if (!validateRepoUrl(input.repo_url)) errors.push("GitHub repo URL must be a valid https://github.com owner/repo URL.");
  errors.push(...validateCommandSet({ install: input.install, build: input.build, start: input.start, healthCheck: input.healthCheck }));
  if (errors.length) return { ok: false, errors };

  const bot_id = normalizeBotId(input.name);
  const [registry, secrets, tasks] = await Promise.all([getDiscordBotRegistry(), getDiscordBotSecrets(), getTasks()]);
  if (registry.some((row) => row.bot_id === bot_id)) return { ok: false, errors: ["A bot with this name/id already exists."] };
  if (hasActiveDuplicate(tasks, bot_id, "deploy")) return { ok: false, errors: ["A deploy task for this bot is already active."] };

  const workingDir = input.working_directory.trim() || bot_id;
  const workspacePath = await ensureBotWorkspace(bot_id);
  const timestamp = nowIso();
  const deployment_id = `deploy-${bot_id}-${Date.now()}`;
  const env_var_names = Array.from(new Set([
    ...(input.discordToken ? ["DISCORD_TOKEN"] : []),
    ...(input.clientId ? ["CLIENT_ID"] : []),
    ...(input.guildId ? ["GUILD_ID"] : []),
    ...Object.keys(input.additionalEnv || {}),
  ])).sort();

  const bot: DiscordBotRegistryEntry = {
    bot_id,
    name: input.name.trim(),
    repo_url: input.repo_url.trim(),
    branch: input.branch.trim() || "main",
    runtime_type: input.runtime_type.trim() || "node",
    working_directory: workingDir,
    commands: {
      install: input.install.trim(),
      build: input.build.trim(),
      start: input.start.trim(),
      healthCheck: input.healthCheck.trim(),
    },
    env_var_names,
    status: "stopped",
    health_score: 100,
    last_deployed_at: null,
    last_healthy_at: null,
    restart_count: 0,
    auto_fix_enabled: input.autoFixEnabled,
    rollback_enabled: input.rollbackEnabled,
    current_commit: null,
    previous_healthy_commit: null,
    last_incident_id: null,
    last_deployment_id: deployment_id,
    restart_policy: input.restartPolicy,
    template: input.template || null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  registry.push(bot);
  await saveDiscordBotRegistry(registry);

  secrets[bot_id] = {
    ...(input.discordToken ? { DISCORD_TOKEN: input.discordToken } : {}),
    ...(input.clientId ? { CLIENT_ID: input.clientId } : {}),
    ...(input.guildId ? { GUILD_ID: input.guildId } : {}),
    ...(input.additionalEnv && Object.keys(input.additionalEnv).length ? { additional_env: input.additionalEnv } : {}),
  };
  await saveDiscordBotSecrets(secrets);

  const deploymentRecord: DiscordDeploymentRecord = {
    deployment_id,
    bot_id,
    repo_url: bot.repo_url,
    branch: bot.branch,
    commit: null,
    started_at: timestamp,
    finished_at: null,
    status: "queued",
    validation_result: "pending",
    rollback_available: false,
    summary: "Initial deploy task created from dashboard form.",
    artifacts: [workspacePath],
  };
  await saveDiscordDeployment(deploymentRecord);
  await saveDiscordHealthReport({ updatedAt: timestamp, bots: [{ bot_id, status: bot.status, health_score: bot.health_score, summary: "Registered and awaiting first deployment." }] });

  await appendTask({
    id: `discord-deploy-${bot_id}-${Date.now()}`,
    title: `Deploy Discord bot: ${bot.name}`,
    description: `Clone/pull, validate, build, and start Discord bot ${bot.name}.`,
    owner: "discord-bot-ops",
    status: "queued",
    priority: "high",
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "dashboard-discord-bots",
    tags: ["discord-bot", "deploy"],
    context: {
      bot_id,
      action: "deploy",
      deployment_id,
      runtime_type: bot.runtime_type,
      workspace: workspacePath,
      allowlistedCommandProfile: "discord-bot-safe",
    },
    statusHistory: [{ status: "queued", at: timestamp, note: "Created from Discord Bots deploy form." }],
  });

  return { ok: true, bot_id };
}

export async function queueDiscordBotAction(botId: string, action: "redeploy" | "restart" | "rollback" | "pull-latest" | "stop" | "start" | "diagnose"): Promise<{ ok: boolean; error?: string }> {
  const [registry, tasks] = await Promise.all([getDiscordBotRegistry(), getTasks()]);
  const bot = registry.find((item) => item.bot_id === botId);
  if (!bot) return { ok: false, error: "Bot not found." };
  if (hasActiveDuplicate(tasks, botId, action)) return { ok: false, error: `An active ${action} task already exists for this bot.` };

  const timestamp = nowIso();
  await appendTask({
    id: `discord-${action}-${botId}-${Date.now()}`,
    title: `${action.replace(/-/g, " ")} Discord bot: ${bot.name}`,
    description: `Execute ${action} workflow for Discord bot ${bot.name}.`,
    owner: "discord-bot-ops",
    status: "queued",
    priority: action === "rollback" ? "high" : "medium",
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "dashboard-discord-bots",
    tags: ["discord-bot", action],
    context: { bot_id: botId, action },
    statusHistory: [{ status: "queued", at: timestamp, note: `Created ${action} task from Discord bot dashboard.` }],
  });

  return { ok: true };
}

export function getTemplateDefaults(templateId?: string) {
  return DISCORD_BOT_TEMPLATES.find((item) => item.id === templateId) || DISCORD_BOT_TEMPLATES[0];
}

export async function touchTaskFile(): Promise<void> {
  await fs.access(TASKS_FILE);
}
