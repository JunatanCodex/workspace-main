import path from "node:path";
import { AGENTS_ROOT } from "@/lib/config";
import type { DiscordBotRegistryEntry } from "@/lib/discord-bots/types";
import { isAllowedCommand, validateRepoUrl } from "@/lib/discord-bots/validation";

const BOT_OPS_ROOT = path.join(AGENTS_ROOT, "discord-bot-ops");
const BOT_WORKSPACE_ROOT = path.join(BOT_OPS_ROOT, "workspace", "bots");

export type SafeOperation =
  | { kind: "git-clone-or-update"; repoUrl: string; branch: string }
  | { kind: "git-checkout"; ref: string }
  | { kind: "git-rev-parse" }
  | { kind: "run-allowed"; command: string }
  | { kind: "start-managed"; command: string }
  | { kind: "stop-managed" }
  | { kind: "health-check"; command: string };

export function assertSafeBotConfig(bot: DiscordBotRegistryEntry) {
  const errors: string[] = [];
  if (!validateRepoUrl(bot.repo_url)) errors.push("Repo URL is not an approved GitHub URL.");
  if (!/^[A-Za-z0-9._/-]+$/.test(bot.branch)) errors.push("Branch contains unsupported characters.");
  for (const [name, value] of Object.entries(bot.commands || {})) {
    if (!value) continue;
    if (!isAllowedCommand(value)) errors.push(`${name} command is not in the safe allowlist.`);
  }
  if (errors.length) throw new Error(errors.join(" "));
}

export function ensureBotPathWithinWorkspace(botId: string, workingDirectory: string) {
  const botRoot = path.join(BOT_WORKSPACE_ROOT, botId);
  const resolved = path.resolve(botRoot, workingDirectory || ".");
  const rootResolved = path.resolve(botRoot);
  if (!resolved.startsWith(rootResolved)) throw new Error("Working directory escapes the bot workspace.");
  return { botRoot, resolved };
}

export function buildOperationPlan(bot: DiscordBotRegistryEntry, action: string): SafeOperation[] {
  assertSafeBotConfig(bot);
  const ops: SafeOperation[] = [];
  if (["deploy", "redeploy", "pull-latest"].includes(action)) {
    ops.push({ kind: "git-clone-or-update", repoUrl: bot.repo_url, branch: bot.branch });
    ops.push({ kind: "git-checkout", ref: bot.branch });
  }
  if (["deploy", "redeploy"].includes(action)) {
    if (bot.commands.install) ops.push({ kind: "run-allowed", command: bot.commands.install });
    if (bot.commands.build) ops.push({ kind: "run-allowed", command: bot.commands.build });
  }
  if (["deploy", "redeploy", "start", "restart", "rollback"].includes(action) && bot.commands.start) {
    ops.push({ kind: "start-managed", command: bot.commands.start });
    if (bot.commands.healthCheck) ops.push({ kind: "health-check", command: bot.commands.healthCheck });
  }
  if (action === "stop") ops.push({ kind: "stop-managed" });
  if (action === "diagnose" && bot.commands.healthCheck) ops.push({ kind: "health-check", command: bot.commands.healthCheck });
  if (action === "rollback" && bot.previous_healthy_commit) {
    return [{ kind: "git-checkout", ref: bot.previous_healthy_commit }, ...ops];
  }
  ops.push({ kind: "git-rev-parse" });
  return ops;
}
