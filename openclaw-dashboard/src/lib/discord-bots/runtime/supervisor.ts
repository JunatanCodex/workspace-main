import path from "node:path";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DiscordBotRegistryEntry } from "@/lib/discord-bots/types";

const execFileAsync = promisify(execFile);
const SYSTEMD_USER_DIR = path.join(process.env.HOME || "/home/jim", ".config", "systemd", "user");

function serviceName(botId: string) {
  return `openclaw-discord-bot-${botId}.service`;
}

function servicePath(botId: string) {
  return path.join(SYSTEMD_USER_DIR, serviceName(botId));
}

export async function writeBotService(bot: DiscordBotRegistryEntry, repoRoot: string, env: Record<string, string>) {
  await fs.mkdir(SYSTEMD_USER_DIR, { recursive: true });
  const envLines = Object.entries(env)
    .map(([key, value]) => `Environment=${key}=${String(value).replace(/\n/g, " ")}`)
    .join("\n");
  const content = `[Unit]\nDescription=OpenClaw Discord Bot ${bot.name}\nAfter=network-online.target default.target\nWants=network-online.target\n\n[Service]\nType=simple\nWorkingDirectory=${repoRoot}\n${envLines}\nExecStart=/bin/bash -lc '${bot.commands.start}'\nRestart=${bot.restart_policy === "manual" ? "no" : "on-failure"}\nRestartSec=5\nStartLimitIntervalSec=300\nStartLimitBurst=10\nStandardOutput=append:${path.join(repoRoot, ".bot-stdout.log")}\nStandardError=append:${path.join(repoRoot, ".bot-stderr.log")}\n\n[Install]\nWantedBy=default.target\n`;
  await fs.writeFile(servicePath(bot.bot_id), content, "utf8");
  await execFileAsync("systemctl", ["--user", "daemon-reload"]);
  return serviceName(bot.bot_id);
}

export async function startBotService(botId: string) {
  await execFileAsync("systemctl", ["--user", "enable", "--now", serviceName(botId)]);
}

export async function restartBotService(botId: string) {
  await execFileAsync("systemctl", ["--user", "restart", serviceName(botId)]);
}

export async function stopBotService(botId: string) {
  await execFileAsync("systemctl", ["--user", "stop", serviceName(botId)]);
}

export async function getBotServiceStatus(botId: string): Promise<{ active: boolean; text: string }> {
  try {
    const { stdout } = await execFileAsync("systemctl", ["--user", "status", serviceName(botId), "--no-pager", "-n", "20"]);
    return { active: /Active: active \(running\)/.test(stdout), text: stdout };
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    return { active: false, text: `${err.stdout || ""}\n${err.stderr || err.message}`.trim() };
  }
}
