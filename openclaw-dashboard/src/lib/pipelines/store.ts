import path from "node:path";
import { promises as fs } from "node:fs";

export interface PipelineStepDef {
  agentId: string;
  label: string;
  condition?: string;
}

export interface PipelineDef {
  id: string;
  name: string;
  kind: string;
  enabled: boolean;
  autoRun: boolean;
  retries?: number;
  failureBehavior?: string;
  approvalGates?: string[];
  steps: PipelineStepDef[];
}

const PIPELINE_FILE = path.join(process.cwd(), "pipeline-definitions", "pipelines.json");

export async function readPipelineDefs(): Promise<PipelineDef[]> {
  try {
    const raw = await fs.readFile(PIPELINE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePipelineDefs(defs: PipelineDef[]) {
  await fs.mkdir(path.dirname(PIPELINE_FILE), { recursive: true });
  await fs.writeFile(PIPELINE_FILE, `${JSON.stringify(defs, null, 2)}\n`, "utf8");
}
