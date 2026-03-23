import path from "node:path";
import { promises as fs } from "node:fs";
import type { AgentConfig, AgentDetails, AgentFileSummary, TriggerType } from "@/lib/types";
import { EXPECTED_FLEET, getFleetProfile } from "@/lib/fleet";
import { cleanBullet, extractRole, extractSectionLines } from "@/lib/utils/text";
import { getTasks } from "./tasks";
import { getRegisteredAgents, getCronJobs } from "./openclaw";
import { readTextIfExists, statIfExists } from "./safe-read";
import { inferAgentStatus } from "@/lib/domain/agent-status";

const OUTPUT_EXTENSIONS = new Set([".md", ".json", ".txt", ".log"]);
const NON_OUTPUT_FILES = new Set(["SOUL.md", "AGENTS.md", "README.md", "BOOTSTRAP.md", "HEARTBEAT.md", "IDENTITY.md", "TOOLS.md", "USER.md"]);

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

function scoreOutputMatch(agentId: string, file: AgentFileSummary): number {
  const profile = getFleetProfile(agentId);
  const name = file.name.toLowerCase();
  if (!profile) return 0;
  return profile.outputKeywords.reduce((score, keyword) => score + (name.includes(keyword) ? 1 : 0), 0);
}

export async function getAgents(): Promise<AgentDetails[]> {
  const [registeredAgents, tasks, cronJobs] = await Promise.all([getRegisteredAgents(), getTasks(), getCronJobs()]);
  const registeredMap = new Map(registeredAgents.map((agent) => [agent.id, agent]));
  const allIds = Array.from(new Set([...EXPECTED_FLEET.map((agent) => agent.id), ...registeredAgents.map((agent) => agent.id)])).sort();

  return Promise.all(
    allIds.map(async (agentId) => {
      const registered = registeredMap.get(agentId);
      const profile = getFleetProfile(agentId);
      const workspace = registered?.workspace || path.join("/home/jim/.openclaw/agents", agentId);
      const soulPath = path.join(workspace, "SOUL.md");
      const agentsPath = path.join(workspace, "AGENTS.md");
      const [soul, startup, files] = await Promise.all([
        readTextIfExists(soulPath),
        readTextIfExists(agentsPath),
        listFilesShallow(workspace),
      ]);

      const pendingTasks = tasks.filter((task) => task.owner === agentId && !["done", "cancelled"].includes(String(task.status)));
      const recentCompletedTasks = tasks.filter((task) => task.owner === agentId && task.status === "done");
      const outputCandidates = files.filter((file) => OUTPUT_EXTENSIONS.has(path.extname(file.name)) && !NON_OUTPUT_FILES.has(file.name));
      const suggestedOutputFiles = [...outputCandidates].sort((a, b) => scoreOutputMatch(agentId, b) - scoreOutputMatch(agentId, a) || b.modifiedAt.localeCompare(a.modifiedAt)).slice(0, 5);
      const latestOutputFile = suggestedOutputFiles[0] || outputCandidates[0];
      const lastFile = files[0];
      const startupInstructions = extractSectionLines(startup || "", "Startup").map(cleanBullet);
      const schedule = extractSectionLines(startup || "", "Schedule / operating rhythm").map(cleanBullet);
      const triggerType = registered ? inferTriggerType(registered, startup || "", cronJobs) : "unknown";
      const lastRunTime = latestOutputFile?.modifiedAt || lastFile?.modifiedAt || (await statIfExists(agentsPath))?.mtime.toISOString();
      const details: AgentDetails = {
        id: agentId,
        name: registered?.identity?.name || profile?.name || agentId,
        emoji: registered?.identity?.emoji || profile?.emoji,
        workspace,
        role: extractRole(soul || "") || profile?.focus,
        startupInstructions,
        schedule,
        triggerType,
        latestFile: lastFile,
        latestOutputFile,
        recentFiles: files.slice(0, 8),
        pendingTasks,
        recentCompletedTasks,
        status: registered ? "idle" : "missing",
        lastRunTime,
        lastOutputTime: latestOutputFile?.modifiedAt,
        summary: !registered
          ? "Expected in fleet model, but not yet registered in OpenClaw config."
          : latestOutputFile
            ? `Latest output: ${latestOutputFile.name}`
            : pendingTasks.length > 0
              ? `${pendingTasks.length} pending task(s), but no output file yet.`
              : "No recent outputs yet.",
        focus: profile?.focus,
        expectedOutputs: profile?.expectedOutputs || [],
        suggestedOutputFiles,
        isExpected: Boolean(profile),
        isRegistered: Boolean(registered),
      };
      if (registered) details.status = inferAgentStatus(details);
      return details;
    }),
  );
}

export async function getAgentById(agentId: string): Promise<AgentDetails | null> {
  const agents = await getAgents();
  return agents.find((agent) => agent.id === agentId) || null;
}
