import path from "node:path";
import { promises as fs } from "node:fs";
import { AGENTS_ROOT, DIGEST_FILE } from "@/lib/config";
import { getTasks, saveTasks } from "@/lib/fs/tasks";
import {
  getDiscordBotRegistry,
  getDiscordBotSecrets,
  getDiscordDeployments,
  getDiscordIncidents,
  getDiscordHealthReport,
  saveDiscordBotRegistry,
  saveDiscordDeployment,
  saveDiscordHealthReport,
} from "@/lib/discord-bots/store";
import type { DiscordBotRegistryEntry, DiscordDeploymentRecord } from "@/lib/discord-bots/types";
import { appendBotLog, readRecentBotLogs } from "./logs";
import { inferBotHealth } from "./health";
import { createIncident } from "./incidents";
import { runSafeCommand } from "./exec";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, "discord-bot-ops");
const BOT_WORKSPACE_ROOT = path.join(BOT_OPS_ROOT, "workspace", "bots");
const DEPLOYMENT_SUMMARY_FILE = path.join(BOT_OPS_ROOT, "deployment-summary.md");
const INCIDENT_SUMMARY_FILE = path.join(BOT_OPS_ROOT, "incident-summary.md");
const FIX_ATTEMPTS_FILE = path.join(BOT_OPS_ROOT, "fix-attempts.json");

function buildBotWorkspace(bot: DiscordBotRegistryEntry) {
  return path.join(BOT_WORKSPACE_ROOT, bot.bot_id, bot.working_directory || ".");
}

function buildRepoRoot(bot: DiscordBotRegistryEntry) {
  return path.join(BOT_WORKSPACE_ROOT, bot.bot_id);
}

async function ensureBotPaths(bot: DiscordBotRegistryEntry) {
  await fs.mkdir(buildRepoRoot(bot), { recursive: true });
  await fs.mkdir(buildBotWorkspace(bot), { recursive: true });
}

function makeEnv(secrets: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(secrets).filter(([, value]) => typeof value === "string" && value.length > 0)) as Record<string, string>;
}

async function markRuntimeOk(bot: DiscordBotRegistryEntry) {
  await fs.writeFile(path.join(buildRepoRoot(bot), ".runtime-ok"), new Date().toISOString(), "utf8");
}

async function updateBot(botId: string, updater: (bot: DiscordBotRegistryEntry) => DiscordBotRegistryEntry | Promise<DiscordBotRegistryEntry>) {
  const registry = await getDiscordBotRegistry();
  const idx = registry.findIndex((item) => item.bot_id === botId);
  if (idx < 0) throw new Error(`Bot not found: ${botId}`);
  registry[idx] = await updater(registry[idx]);
  await saveDiscordBotRegistry(registry);
  return registry[idx];
}

async function appendFixAttempt(botId: string, action: string, ok: boolean, note: string) {
  let rows: Array<Record<string, unknown>> = [];
  try {
    rows = JSON.parse(await fs.readFile(FIX_ATTEMPTS_FILE, "utf8"));
  } catch {}
  rows.push({ ts: new Date().toISOString(), bot_id: botId, action, ok, note });
  await fs.writeFile(FIX_ATTEMPTS_FILE, `${JSON.stringify(rows.slice(-500), null, 2)}\n`, "utf8");
}

async function writeSummaries() {
  const [deployments, incidents, bots] = await Promise.all([getDiscordDeployments(), getDiscordIncidents(), getDiscordBotRegistry()]);
  const deploymentMd = [
    "# Discord Bot Deployment Summary",
    "",
    ...deployments.slice(0, 20).map((item) => `- ${item.bot_id}: ${item.status} · ${item.started_at} · ${item.summary || "No summary"}`),
  ].join("\n");
  const incidentMd = [
    "# Discord Bot Incident Summary",
    "",
    ...incidents.slice(0, 20).map((item) => `- ${item.bot_id}: ${item.severity} · ${item.human_summary}`),
    "",
    "## Fleet snapshot",
    ...bots.map((bot) => `- ${bot.name}: ${bot.status} · health ${bot.health_score}`),
  ].join("\n");

  await fs.writeFile(DEPLOYMENT_SUMMARY_FILE, `${deploymentMd}\n`, "utf8");
  await fs.writeFile(INCIDENT_SUMMARY_FILE, `${incidentMd}\n`, "utf8");
}

export async function runBotAction(botId: string, action: string) {
  const [registry, secrets] = await Promise.all([getDiscordBotRegistry(), getDiscordBotSecrets()]);
  const bot = registry.find((item) => item.bot_id === botId);
  if (!bot) throw new Error(`Bot not found: ${botId}`);

  await ensureBotPaths(bot);
  const repoRoot = buildRepoRoot(bot);
  const workDir = buildBotWorkspace(bot);
  const secretRecord = secrets[botId] || {};
  const env = makeEnv({
    DISCORD_TOKEN: secretRecord.DISCORD_TOKEN,
    CLIENT_ID: secretRecord.CLIENT_ID,
    GUILD_ID: secretRecord.GUILD_ID,
    ...(secretRecord.additional_env || {}),
  });

  const deployment_id = `deployment-${botId}-${Date.now()}`;
  const deployment: DiscordDeploymentRecord = {
    deployment_id,
    bot_id: botId,
    repo_url: bot.repo_url,
    branch: bot.branch,
    commit: bot.current_commit || null,
    started_at: new Date().toISOString(),
    finished_at: null,
    status: "in_progress",
    validation_result: "pending",
    rollback_available: Boolean(bot.previous_healthy_commit),
    summary: `${action} action started.`,
    artifacts: [repoRoot],
  };
  await saveDiscordDeployment(deployment);

  const commandPlan: string[] = [];
  if (action === "deploy" || action === "redeploy" || action === "pull-latest") {
    commandPlan.push(
      `[ -d .git ] && git fetch --all --prune || git clone --branch ${bot.branch} ${bot.repo_url} .`,
      `git checkout ${bot.branch}`,
      `git pull --ff-only origin ${bot.branch}`,
    );
  }
  if (action === "deploy" || action === "redeploy") {
    if (bot.commands.install) commandPlan.push(bot.commands.install);
    if (bot.commands.build) commandPlan.push(bot.commands.build);
  }
  if (["deploy", "redeploy", "restart", "start", "rollback"].includes(action) && bot.commands.start) {
    commandPlan.push(`nohup ${bot.commands.start} > .bot-stdout.log 2> .bot-stderr.log < /dev/null & echo $! > .bot-pid`);
    if (bot.commands.healthCheck) commandPlan.push(bot.commands.healthCheck);
  }
  if (action === "stop") {
    commandPlan.push(`test -f .bot-pid && kill $(cat .bot-pid) || true`);
  }
  if (action === "diagnose" && bot.commands.healthCheck) {
    commandPlan.push(bot.commands.healthCheck);
  }
  if (action === "rollback" && bot.previous_healthy_commit) {
    commandPlan.unshift(`git checkout ${bot.previous_healthy_commit}`);
  }

  const attemptedFixes: string[] = [];
  const results = [] as Array<{ command: string; ok: boolean; stderr: string; stdout: string }>;
  let failedOutput = "";

  for (const command of commandPlan) {
    await appendBotLog(botId, "info", `Running command`, { command, action });
    const result = await runSafeCommand(command, repoRoot, env);
    results.push({ command, ok: result.ok, stderr: result.stderr, stdout: result.stdout });
    if (!result.ok) {
      failedOutput = `${result.error || "Command failed"}\n${result.stderr || result.stdout}`.trim();
      await appendBotLog(botId, "error", `Command failed`, { command, error: result.error, stderr: result.stderr });
      break;
    }
  }

  if (failedOutput) {
    const incident = await createIncident(botId, failedOutput, attemptedFixes, true);
    await appendFixAttempt(botId, action, false, incident.human_summary);
    await updateBot(botId, (current) => ({
      ...current,
      status: "failed",
      health_score: Math.max(0, current.health_score - 20),
      last_incident_id: incident.incident_id,
      last_deployment_id: deployment_id,
      updated_at: new Date().toISOString(),
    }));
    await saveDiscordDeployment({ ...deployment, finished_at: new Date().toISOString(), status: "failed", validation_result: "failed", summary: incident.human_summary });
    await writeSummaries();
    return { ok: false, deployment_id, incident_id: incident.incident_id, error: incident.human_summary };
  }

  await markRuntimeOk(bot);
  const commitResult = await runSafeCommand("git rev-parse HEAD", repoRoot, env);
  const currentCommit = commitResult.ok ? commitResult.stdout.trim() : bot.current_commit || null;
  const health = await inferBotHealth(bot, BOT_WORKSPACE_ROOT);

  const updatedBot = await updateBot(botId, (current) => ({
    ...current,
    status: action === "stop" ? "stopped" : health.status,
    health_score: health.health_score,
    last_deployed_at: ["deploy", "redeploy", "rollback"].includes(action) ? new Date().toISOString() : current.last_deployed_at,
    last_healthy_at: action === "stop" ? current.last_healthy_at : new Date().toISOString(),
    current_commit: currentCommit,
    previous_healthy_commit: current.current_commit || current.previous_healthy_commit,
    restart_count: ["restart", "redeploy", "rollback", "deploy", "start"].includes(action) ? current.restart_count + 1 : current.restart_count,
    last_deployment_id: deployment_id,
    updated_at: new Date().toISOString(),
  }));

  await appendFixAttempt(botId, action, true, `${action} completed successfully`);
  await saveDiscordDeployment({
    ...deployment,
    commit: currentCommit,
    finished_at: new Date().toISOString(),
    status: "done",
    validation_result: health.status,
    rollback_available: Boolean(updatedBot.previous_healthy_commit),
    summary: `${action} completed. ${health.summary}`,
  });
  await appendBotLog(botId, "info", `${action} completed`, { currentCommit, health });
  await writeSummaries();
  return { ok: true, deployment_id, current_commit: currentCommit, status: updatedBot.status, health_score: updatedBot.health_score };
}

export async function monitorDiscordBots() {
  const [registry, tasks] = await Promise.all([getDiscordBotRegistry(), getTasks()]);
  const reportBots: Array<{ bot_id: string; status: string; health_score: number; summary?: string }> = [];

  for (const bot of registry) {
    const health = await inferBotHealth(bot, BOT_WORKSPACE_ROOT);
    reportBots.push({ bot_id: bot.bot_id, status: health.status, health_score: health.health_score, summary: health.summary });

    await updateBot(bot.bot_id, (current) => ({
      ...current,
      status: current.status === "stopped" ? "stopped" : health.status,
      health_score: health.health_score,
      updated_at: new Date().toISOString(),
    }));

    const activeFix = tasks.some((task) => {
      const status = String(task.status || "queued");
      if (["done", "cancelled", "failed", "error"].includes(status)) return false;
      const context = (task.context || {}) as Record<string, unknown>;
      return task.owner === "discord-bot-ops" && context.bot_id === bot.bot_id && ["restart", "redeploy", "rollback", "diagnose"].includes(String(context.action || ""));
    });

    if (health.status !== "healthy" && bot.auto_fix_enabled && !activeFix) {
      const rows = await getTasks();
      rows.push({
        id: `discord-auto-restart-${bot.bot_id}-${Date.now()}`,
        title: `Auto-fix restart for Discord bot: ${bot.name}`,
        description: `Safe automatic restart queued after health monitor marked bot unhealthy.`,
        owner: "discord-bot-ops",
        status: "queued",
        priority: "high",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: "discord-bot-heartbeat",
        tags: ["discord-bot", "restart", "auto-fix"],
        context: { bot_id: bot.bot_id, action: "restart", auto_fix: true },
        statusHistory: [{ status: "queued", at: new Date().toISOString(), note: "Queued by hourly Discord bot monitor." }],
      });
      await saveTasks(rows);
      await appendBotLog(bot.bot_id, "warn", `Queued safe auto-fix restart from monitor`, { health });
    }
  }

  await saveDiscordHealthReport({ updatedAt: new Date().toISOString(), bots: reportBots });
  await writeSummaries();
  await updateDigestWithDiscordBots();
  return { ok: true, updatedAt: new Date().toISOString(), bots: reportBots };
}

async function updateDigestWithDiscordBots() {
  const [health, incidents, deployments] = await Promise.all([getDiscordHealthReport(), getDiscordIncidents(), getDiscordDeployments()]);
  const section = [
    "",
    "## Discord Bots",
    `- Health snapshot updated: ${health.updatedAt || "unknown"}`,
    ...(health.bots || []).map((bot) => `- ${bot.bot_id}: ${bot.status} · health ${bot.health_score}${bot.summary ? ` · ${bot.summary}` : ""}`),
    "",
    "### Recent Discord bot deployments",
    ...deployments.slice(0, 5).map((item) => `- ${item.bot_id}: ${item.status} · ${item.started_at}`),
    "",
    "### Recent Discord bot incidents",
    ...incidents.slice(0, 5).map((item) => `- ${item.bot_id}: ${item.severity} · ${item.human_summary}`),
    "",
  ].join("\n");

  let existing = "# Daily Digest\n\n";
  try {
    existing = await fs.readFile(DIGEST_FILE, "utf8");
  } catch {}

  const next = existing.replace(/\n## Discord Bots[\s\S]*$/m, "") + section;
  await fs.writeFile(DIGEST_FILE, next, "utf8");
}

export async function processDiscordBotQueue() {
  const tasks = await getTasks();
  const queued = tasks.filter((task) => task.owner === "discord-bot-ops" && task.status === "queued");
  const handled: string[] = [];

  for (const task of queued) {
    const context = (task.context || {}) as Record<string, unknown>;
    const bot_id = String(context.bot_id || "");
    const action = String(context.action || "diagnose");
    if (!bot_id) continue;

    task.status = "in_progress";
    task.updatedAt = new Date().toISOString();
    task.statusHistory = [...(Array.isArray(task.statusHistory) ? task.statusHistory : []), { status: "in_progress", at: task.updatedAt, note: `Processing ${action} action.` }];
    await saveTasks(tasks);

    const result = await runBotAction(bot_id, action);
    task.status = result.ok ? "done" : "failed";
    task.updatedAt = new Date().toISOString();
    task.failureReason = result.ok ? undefined : String(result.error || "Discord bot action failed.");
    task.statusHistory = [...(Array.isArray(task.statusHistory) ? task.statusHistory : []), { status: task.status, at: task.updatedAt, note: result.ok ? `${action} completed.` : `Failed: ${task.failureReason}` }];
    handled.push(String(task.id || ""));
    await saveTasks(tasks);
  }

  return { ok: true, handled };
}

export async function getBotConsoleLines(botId: string) {
  return readRecentBotLogs(botId, 250);
}
