import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appendCliHistory } from "@/lib/cli/history";
import { getCliCommand } from "@/lib/cli/registry";

const execFileAsync = promisify(execFile);

export async function runCliAction(commandId: string, input: Record<string, string> = {}) {
  const command = getCliCommand(commandId);
  if (!command) throw new Error(`Unsupported CLI action: ${commandId}`);

  const started = Date.now();
  const timestamp = new Date().toISOString();
  const historyBase = {
    id: `${commandId}-${timestamp}`,
    commandId,
    label: command.label,
    support: command.support,
    timestamp,
  };

  if (command.support !== "supported") {
    const record = {
      ...historyBase,
      ok: false,
      note: `${command.support}: ${command.description}`,
    };
    await appendCliHistory(record);
    return record;
  }

  try {
    let result: { stdout?: string; stderr?: string } = {};
    if (commandId === "trigger-orchestrator") {
      result = await execFileAsync("openclaw", ["agent", "--agent", "orchestrator", "--message", input.message || "Check the shared queue and summarize anything needing attention.", "--json"], { timeout: 60000, maxBuffer: 1024 * 1024 });
    } else if (commandId === "trigger-agent") {
      const agentId = input.agentId || "";
      const message = input.message || "";
      if (!agentId || !message) throw new Error("agentId and message are required for trigger-agent");
      result = await execFileAsync("openclaw", ["agent", "--agent", agentId, "--message", message, "--json"], { timeout: 60000, maxBuffer: 1024 * 1024 });
    } else if (commandId === "refresh-state") {
      result = { stdout: "State refresh is file-backed and immediate; no shell command required.", stderr: "" };
    } else {
      throw new Error(`No mapping implemented for ${commandId}`);
    }

    const record = {
      ...historyBase,
      ok: true,
      durationMs: Date.now() - started,
      stdout: result.stdout,
      stderr: result.stderr,
    };
    await appendCliHistory(record);
    return record;
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    const record = {
      ...historyBase,
      ok: false,
      durationMs: Date.now() - started,
      stdout: err.stdout,
      stderr: err.stderr,
      note: err.message,
    };
    await appendCliHistory(record);
    return record;
  }
}
