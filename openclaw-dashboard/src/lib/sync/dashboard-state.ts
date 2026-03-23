import { getAgents } from "@/lib/fs/agents";
import { getTasks } from "@/lib/fs/tasks";
import { getAlerts } from "@/lib/domain/alerts";
import { sharedStore } from "@/lib/automation/store";
import { replaceAgents } from "@/lib/db/agents";
import { replaceAlerts } from "@/lib/db/alerts";
import { mirrorTaskMutation } from "@/lib/db/tasks";
import { replacePipelineRuns } from "@/lib/db/pipeline-runs";
import type { AppRole } from "@/lib/auth/roles";

function normalizeRunId(value: string) {
  return /^[0-9a-fA-F-]{36}$/.test(value) ? value : crypto.randomUUID();
}

export async function syncDashboardStateToSupabase(actor: { userId: string; role: AppRole }) {
  const [agents, tasks, alerts, runsDoc] = await Promise.all([
    getAgents(),
    getTasks(),
    getAlerts(),
    sharedStore.readRuns(),
  ]);

  await replaceAgents(agents);
  await Promise.all(tasks.filter((task) => task.id).map((task) => mirrorTaskMutation(task, actor)));
  await replaceAlerts(alerts);
  await replacePipelineRuns(
    (runsDoc.runs || []).map((run) => ({
      id: normalizeRunId(run.run_id),
      pipeline_name: run.pipeline_name,
      source_task_id: run.source_task_id,
      current_stage: run.current_stage,
      stage_status: run.stage_status,
      final_status: run.final_status,
      linked_task_ids: run.linked_task_ids,
      started_at: run.started_at,
      updated_at: run.updated_at,
      metadata: { legacy_run_id: run.run_id },
    })),
  );

  return {
    agents: agents.length,
    tasks: tasks.length,
    alerts: alerts.length,
    pipelineRuns: (runsDoc.runs || []).length,
  };
}
