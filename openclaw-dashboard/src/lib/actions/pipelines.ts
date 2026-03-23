"use server";

import { revalidatePath } from "next/cache";
import { readPipelineDefs, savePipelineDefs } from "@/lib/pipelines/store";
import { appendCliHistory } from "@/lib/cli/history";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export async function togglePipelineEnabledAction(formData: FormData) {
  const id = String(formData.get("pipelineId") || "").trim();
  const defs = await readPipelineDefs();
  const pipeline = defs.find((item) => item.id === id);
  if (!pipeline) throw new Error("Pipeline not found.");
  pipeline.enabled = !pipeline.enabled;
  await savePipelineDefs(defs);
  revalidatePath("/pipelines");
}

export async function togglePipelineAutoRunAction(formData: FormData) {
  const id = String(formData.get("pipelineId") || "").trim();
  const defs = await readPipelineDefs();
  const pipeline = defs.find((item) => item.id === id);
  if (!pipeline) throw new Error("Pipeline not found.");
  pipeline.autoRun = !pipeline.autoRun;
  await savePipelineDefs(defs);
  revalidatePath("/pipelines");
}

export async function rerunPipelineAction(formData: FormData) {
  const id = String(formData.get("pipelineId") || "").trim();
  const defs = await readPipelineDefs();
  const pipeline = defs.find((item) => item.id === id);
  if (!pipeline) throw new Error("Pipeline not found.");

  await appendCliHistory({
    id: nowId("pipeline-rerun"),
    commandId: "pipeline-rerun",
    label: `Rerun pipeline: ${pipeline.name}`,
    support: "partial",
    ok: true,
    timestamp: new Date().toISOString(),
    note: "Pipeline rerun is currently file-driven and advisory. Full execution orchestration remains a planned follow-up.",
  });

  revalidatePath("/pipelines");
  revalidatePath("/cli");
}

export async function savePipelineDefinitionAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const kind = String(formData.get("kind") || "custom").trim();
  const enabled = String(formData.get("enabled") || "false") === "true";
  const autoRun = String(formData.get("autoRun") || "false") === "true";
  const retries = Number(formData.get("retries") || 0);
  const failureBehavior = String(formData.get("failureBehavior") || "stop").trim();
  const approvalGates = String(formData.get("approvalGates") || "").split(",").map((v) => v.trim()).filter(Boolean);
  const stepLines = String(formData.get("steps") || "").split(/\r?\n/).map((v) => v.trim()).filter(Boolean);

  if (!id || !name) throw new Error("Pipeline id and name are required.");

  const steps = stepLines.map((line, index) => {
    const [agentId, label, condition] = line.split("|").map((v) => v.trim());
    return { agentId, label: label || `Step ${index + 1}`, condition: condition || "always" };
  }).filter((step) => step.agentId);

  const defs = await readPipelineDefs();
  const existing = defs.find((item) => item.id === id);
  const payload = { id, name, kind, enabled, autoRun, retries, failureBehavior, approvalGates, steps };
  if (existing) Object.assign(existing, payload);
  else defs.push(payload);
  await savePipelineDefs(defs);
  revalidatePath("/pipelines");
}
