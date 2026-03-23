"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { appendTriggerLog } from "@/lib/runtime/trigger-log";
import { requireOperationalAccess } from "@/lib/auth/guard";
import { appendCliAuditLog, buildCliAuditRecord } from "@/lib/db/cli-audit-logs";

const execFileAsync = promisify(execFile);
const SAFE_AGENT_ID = /^[a-z0-9-]{1,64}$/i;
const MAX_MESSAGE_LENGTH = 4000;

async function runAgentTrigger(agentId: string, message: string, actor: { userId: string; role: "owner" | "admin" | "viewer" }) {
  const startedAt = new Date().toISOString();
  const args = ["agent", "--agent", agentId, "--message", message, "--json"];
  await appendCliAuditLog(buildCliAuditRecord({
    commandId: agentId === "orchestrator" ? "trigger-orchestrator" : "trigger-agent",
    label: agentId === "orchestrator" ? "Trigger orchestrator" : "Trigger agent",
    status: "started",
    requestedBy: actor.userId,
    requestedRole: actor.role,
    payload: { agentId, message },
    sanitizedArgs: args,
  }));

  try {
    const { stdout, stderr } = await execFileAsync("openclaw", args, {
      cwd: process.cwd(),
      timeout: 60_000,
      maxBuffer: 1024 * 1024,
    });

    await appendTriggerLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      agentId,
      message,
      ok: true,
      stdout,
      stderr,
      requestedBy: actor.userId,
      requestedRole: actor.role,
    });

    await appendCliAuditLog(buildCliAuditRecord({
      commandId: agentId === "orchestrator" ? "trigger-orchestrator" : "trigger-agent",
      label: agentId === "orchestrator" ? "Trigger orchestrator" : "Trigger agent",
      status: "success",
      requestedBy: actor.userId,
      requestedRole: actor.role,
      payload: { agentId, message },
      sanitizedArgs: args,
      stdout,
      stderr,
    }));

    return { ok: true, stdout, stderr };
  } catch (error) {
    const err = error as Error & { stdout?: string; stderr?: string };
    await appendTriggerLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      agentId,
      message,
      ok: false,
      error: err.message,
      stdout: err.stdout,
      stderr: err.stderr,
      requestedBy: actor.userId,
      requestedRole: actor.role,
    });
    await appendCliAuditLog(buildCliAuditRecord({
      commandId: agentId === "orchestrator" ? "trigger-orchestrator" : "trigger-agent",
      label: agentId === "orchestrator" ? "Trigger orchestrator" : "Trigger agent",
      status: "error",
      requestedBy: actor.userId,
      requestedRole: actor.role,
      payload: { agentId, message },
      sanitizedArgs: args,
      stdout: err.stdout,
      stderr: err.stderr,
      note: err.message,
    }));
    throw error;
  }
}

export async function triggerAgentAction(formData: FormData) {
  const session = await requireOperationalAccess();
  const agentId = String(formData.get("agentId") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!SAFE_AGENT_ID.test(agentId)) throw new Error("Agent is required and must be valid.");
  if (!message) throw new Error("Message is required.");
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error("Message is too long.");

  await runAgentTrigger(agentId, message, { userId: session.user.id, role: session.profile.role });
  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/alerts");
}

export async function triggerOrchestratorAction(formData: FormData) {
  const session = await requireOperationalAccess();
  const message = String(formData.get("message") || "").trim() || "Check the shared queue, update statuses, and summarize anything needing attention.";
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error("Message is too long.");
  await runAgentTrigger("orchestrator", message, { userId: session.user.id, role: session.profile.role });
  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath("/agents/orchestrator");
  revalidatePath("/tasks");
  revalidatePath("/alerts");
  revalidatePath("/digest");
}
