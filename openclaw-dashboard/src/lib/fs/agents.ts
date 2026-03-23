import path from "node:path";
import { promises as fs } from "node:fs";
import type { AgentConfig, AgentDetails, AgentFileSummary, TriggerType } from "@/lib/types";
import { cleanBullet, extractRole, extractSectionLines } from "@/lib/utils/text";
import { getTasks } from "./tasks";
import { getRegisteredAgents, getCronJobs } from "./openclaw";
import { readTextIfExists, statIfExists } from "./safe-read";
import { inferAgentStatus } from "@/lib/domain/agent-status";

const OUTPUT_EXTENSIONS = new Set([".md", ".json", ".txt", ".log"]);

async function listFilesShallow(dir: string): Promise<AgentFileSummary[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const stat = await fs.stat(fullPath);
          return {
            path: fullPath,
            name: entry.name,
            modifiedAt: stat.mtime.toISOString(),
            size: stat.size,
          } satisfies AgentFileSummary;
        }),
    );
    return files.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  } catch {
    return [];
  }
}

function inferTriggerType(agent: AgentConfig, startupText: string, cronJobs: unknown[]): TriggerType {
  const text = startupText.toLowerCase();
  const cronMatch = JSON.stringify(cronJobs).toLowerCase().includes(agent.id.toLowerCase());
  if (cronMatch) return "cron";
  if (text.includes("heartbeat")) return "heartbeat";
  if (text.includes("whenever invoked") || text.includes("on each run")) return "on_demand";
  return "unknown";
}

export async function getAgents(): Promise<AgentDetails[]> {
  const [agents, tasks, cronJobs] = await Promise.all([getRegisteredAgents(), getTasks(), getCronJobs()]);

  return Promise.all(
    agents.map(async (agent) => {
      const soulPath = path.join(agent.workspace, "SOUL.md");
      const agentsPath = path.join(agent.workspace, "AGENTS.md");
      const [soul, startup, files] = await Promise.all([
        readTextIfExists(soulPath),
        readTextIfExists(agentsPath),
        listFilesShallow(agent.workspace),
      ]);

      const pendingTasks = tasks.filter((task) => task.owner === agent.id && !["done", "cancelled"].includes(String(task.status)));
      const recentCompletedTasks = tasks.filter((task) => task.owner === agent.id && task.status === "done");
      const latestOutputFile = files.find((file) => OUTPUT_EXTENSIONS.has(path.extname(file.name)) && !["SOUL.md", "AGENTS.md", "README.md", "BOOTSTRAP.md", "HEARTBEAT.md", "IDENTITY.md", "TOOLS.md", "USER.md"].includes(file.name));
      const lastFile = files[0];
      const startupInstructions = extractSectionLines(startup || "", "Startup").map(cleanBullet);
      const schedule = extractSectionLines(startup || "", "Schedule / operating rhythm").map(cleanBullet);
      const triggerType = inferTriggerType(agent, startup || "", cronJobs);
      const lastRunTime = latestOutputFile?.modifiedAt || lastFile?.modifiedAt || (await statIfExists(agentsPath))?.mtime.toISOString();
      const details: AgentDetails = {
        id: agent.id,
        name: agent.identity?.name || agent.id,
        emoji: agent.identity?.emoji,
        workspace: agent.workspace,
        role: extractRole(soul || ""),
        startupInstructions,
        schedule,
        triggerType,
        latestFile: lastFile,
        latestOutputFile,
        recentFiles: files.slice(0, 8),
        pendingTasks,
        recentCompletedTasks,
        status: "idle",
        lastRunTime,
        lastOutputTime: latestOutputFile?.modifiedAt,
        summary: latestOutputFile
          ? `Latest output: ${latestOutputFile.name}`
          : pendingTasks.length > 0
            ? `${pendingTasks.length} pending task(s), but no output file yet.`
            : "No recent outputs yet.",
      };
      details.status = inferAgentStatus(details);
      return details;
    }),
  );
}

export async function getAgentById(agentId: string): Promise<AgentDetails | null> {
  const agents = await getAgents();
  return agents.find((agent) => agent.id === agentId) || null;
}
