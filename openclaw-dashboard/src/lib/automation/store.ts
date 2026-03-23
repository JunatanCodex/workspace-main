import { promises as fs } from "node:fs";

export interface SharedPipelineStep { agent: string; stage_name: string; trigger_on?: string }
export interface SharedPipelineDef {
  pipeline_name: string;
  enabled: boolean;
  stages: SharedPipelineStep[];
  retry_policy?: Record<string, unknown>;
  approval_behavior?: Record<string, unknown>;
  failure_behavior?: Record<string, unknown>;
}

export interface SharedPipelineRun {
  run_id: string;
  pipeline_name: string;
  source_task_id: string | null;
  current_stage: string;
  stage_status: string;
  linked_task_ids: string[];
  started_at: string;
  updated_at: string;
  final_status: string;
}

export interface SharedEvent {
  timestamp: string;
  event_type: string;
  source_task_id: string | null;
  source_agent: string;
  action_taken: string;
  created_task_id: string | null;
  notes?: string;
}

export interface SharedPipelinesDoc {
  version?: number;
  updatedAt?: string;
  pipelines?: SharedPipelineDef[];
}

export interface SharedRunsDoc {
  version?: number;
  updatedAt?: string;
  runs?: SharedPipelineRun[];
}

export interface SharedEventsDoc {
  version?: number;
  updatedAt?: string;
  events?: SharedEvent[];
}

export interface SharedAutomationRules {
  quiet_mode?: { max_active_pipeline_runs?: number; defer_non_critical_seeding_when_exceeded?: boolean };
  output_parsing?: { positive_markers?: string[]; negative_markers?: string[] };
  duplicate_prevention?: { prevent_same_downstream_stage_for_same_upstream_completion?: boolean; check_recent_similar_tasks?: boolean; recent_window_hours?: number };
  stalled_task_recovery?: { queued_on_demand_minutes?: number; in_progress_hours?: number; retry_once_if_safe?: boolean; mark_routing_issue_if_invalid_owner?: boolean };
  daily_seeding?: Record<string, boolean>;
  rules?: Record<string, string>;
}

const TASKS = "/home/jim/.openclaw/shared/tasks.json";
const PIPELINES = "/home/jim/.openclaw/shared/pipelines.json";
const RUNS = "/home/jim/.openclaw/shared/pipeline-runs.json";
const EVENTS = "/home/jim/.openclaw/shared/event-log.json";
const RULES = "/home/jim/.openclaw/shared/automation-rules.json";
const DIGEST = "/home/jim/.openclaw/shared/digest.md";

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(path: string, value: unknown) {
  await fs.writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export const sharedStore = {
  async readTasks() { return readJson<Record<string, unknown>[]>(TASKS, []); },
  async writeTasks(tasks: Record<string, unknown>[]) { return writeJson(TASKS, tasks); },
  async readPipelines() { return readJson<SharedPipelinesDoc>(PIPELINES, { pipelines: [] }); },
  async readRuns() { return readJson<SharedRunsDoc>(RUNS, { runs: [] }); },
  async writeRuns(runs: SharedRunsDoc) { return writeJson(RUNS, runs); },
  async readEvents() { return readJson<SharedEventsDoc>(EVENTS, { events: [] }); },
  async writeEvents(events: SharedEventsDoc) { return writeJson(EVENTS, events); },
  async readRules() { return readJson<SharedAutomationRules>(RULES, {}); },
  async readDigest() { try { return await fs.readFile(DIGEST, 'utf8'); } catch { return '# Daily Digest\n'; } },
  async writeDigest(content: string) { await fs.writeFile(DIGEST, content, 'utf8'); },
};
