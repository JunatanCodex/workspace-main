"use server";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { appendTriggerLog } from "@/lib/runtime/trigger-log";

const execFileAsync = promisify(execFile);

async function runAgentTrigger(agentId: string, message: string) {
  const startedAt = new Date().toISOString();
  try {
    const { stdout, stderr } = await execFileAsync(
      "openclaw",
      ["agent", "--agent", agentId, "--message", message, "--json"],
      {
        cwd: process.cwd(),
        timeout: 60_000,
        maxBuffer: 1024 * 1024,
      },
    );

    await appendTriggerLog({
      startedAt,
      finishedAt: new Date().toISOString(),
      agentId,
      message,
      ok: true,
      stdout,
      stderr,
    });

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
    });
    throw error;
  }
}

export async function triggerAgentAction(formData: FormData) {
  const agentId = String(formData.get("agentId") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!agentId) throw new Error("Agent is required.");
  if (!message) throw new Error("Message is required.");

  await runAgentTrigger(agentId, message);
  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/alerts");
}

export async function triggerOrchestratorAction(formData: FormData) {
  const message = String(formData.get("message") || "").trim() || "Check the shared queue, update statuses, and summarize anything needing attention.";
  await runAgentTrigger("orchestrator", message);
  revalidatePath("/");
  revalidatePath("/agents");
  revalidatePath("/agents/orchestrator");
  revalidatePath("/tasks");
  revalidatePath("/alerts");
  revalidatePath("/digest");
}
