import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { appendCliHistory } from "@/lib/cli/history";
import { getCliCommand } from "@/lib/cli/registry";
import { requireOperationalAccess } from "@/lib/auth/guard";
import { buildCliAuditRecord, appendCliAuditLog } from "@/lib/db/cli-audit-logs";

const execFileAsync = promisify(execFile);
const SAFE_AGENT_ID = /^[a-z0-9-]{1,64}$/i;
const MAX_MESSAGE_LENGTH = 4000;

function sanitizeInput(commandId: string, input: Record<string, string>) {
  if (commandId === "trigger-agent") {
    const agentId = String(input.agentId || "").trim();
    const message = String(input.message || "").trim();
    if (!SAFE_AGENT_ID.test(agentId)) throw new Error("Invalid agentId.");
    if (!message) throw new Error("message is required.");
    if (message.length > MAX_MESSAGE_LENGTH) throw new Error("message is too long.");
    return { agentId, message };
  }

  if (commandId === "trigger-orchestrator") {
    const message = String(input.message || "Check the shared queue and summarize anything needing attention.").trim();
    if (message.length > MAX_MESSAGE_LENGTH) throw new Error("message is too long.");
    return { message };
  }

  return {};
}

export async function runCliAction(commandId: string, input: Record<string, string> = {}) {
  const session = await requireOperationalAccess();
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
    await appendCliAuditLog(buildCliAuditRecord({
      commandId,
      label: command.label,
      status: "denied",
      requestedBy: session.user.id,
      requestedRole: session.profile.role,
      payload: input,
      note: record.note,
    }));
    await appendCliHistory(record);
    return record;
  }

  let safeInput: Record<string, string> = {};
  try {
    safeInput = sanitizeInput(commandId, input) as Record<string, string>;
  } catch (error) {
    const err = error as Error;
    await appendCliAuditLog(buildCliAuditRecord({
      commandId,
      label: command.label,
      status: "denied",
      requestedBy: session.user.id,
      requestedRole: session.profile.role,
      payload: input,
      note: err.message,
    }));
    throw err;
  }

  try {
    let result: { stdout?: string; stderr?: string } = {};
    let sanitizedArgs: string[] = [];

    if (commandId === "trigger-orchestrator") {
      sanitizedArgs = ["agent", "--agent", "orchestrator", "--message", safeInput.message || "", "--json"];
      await appendCliAuditLog(buildCliAuditRecord({
        commandId,
        label: command.label,
        status: "started",
        requestedBy: session.user.id,
        requestedRole: session.profile.role,
        payload: safeInput,
        sanitizedArgs,
      }));
      result = await execFileAsync("openclaw", sanitizedArgs, { timeout: 60000, maxBuffer: 1024 * 1024 });
    } else if (commandId === "trigger-agent") {
      const agentId = safeInput.agentId || "";
      const message = safeInput.message || "";
      sanitizedArgs = ["agent", "--agent", agentId, "--message", message, "--json"];
      await appendCliAuditLog(buildCliAuditRecord({
        commandId,
        label: command.label,
        status: "started",
        requestedBy: session.user.id,
        requestedRole: session.profile.role,
        payload: safeInput,
        sanitizedArgs,
      }));
      result = await execFileAsync("openclaw", sanitizedArgs, { timeout: 60000, maxBuffer: 1024 * 1024 });
    } else if (commandId === "refresh-state") {
      sanitizedArgs = [];
      await appendCliAuditLog(buildCliAuditRecord({
        commandId,
        label: command.label,
        status: "started",
        requestedBy: session.user.id,
        requestedRole: session.profile.role,
        payload: safeInput,
        sanitizedArgs,
      }));
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
    await appendCliAuditLog(buildCliAuditRecord({
      commandId,
      label: command.label,
      status: "success",
      requestedBy: session.user.id,
      requestedRole: session.profile.role,
      payload: safeInput,
      sanitizedArgs,
      stdout: result.stdout,
      stderr: result.stderr,
      durationMs: record.durationMs,
    }));
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
    await appendCliAuditLog(buildCliAuditRecord({
      commandId,
      label: command.label,
      status: "error",
      requestedBy: session.user.id,
      requestedRole: session.profile.role,
      payload: safeInput,
      stdout: err.stdout,
      stderr: err.stderr,
      note: err.message,
      durationMs: record.durationMs,
    }));
    await appendCliHistory(record);
    return record;
  }
}
