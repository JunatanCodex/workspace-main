import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logDbFallback, maybeSelect } from "@/lib/db/utils";
import type { DbPipelineRunRow } from "@/lib/db/types";

export async function getDashboardPipelineRuns(): Promise<DbPipelineRunRow[]> {
  if (!hasSupabaseEnv()) return [];

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await maybeSelect<DbPipelineRunRow>(supabase, "pipeline_runs");
    if (error || !data) throw error ?? new Error("No pipeline runs returned.");
    return data;
  } catch (error) {
    logDbFallback("pipeline-runs.getDashboardPipelineRuns", error);
    return [];
  }
}

export async function replacePipelineRuns(runs: DbPipelineRunRow[]) {
  if (!hasSupabaseEnv()) return;

  try {
    const supabase = createSupabaseAdminClient();
    const { error: deleteError } = await supabase.from("pipeline_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) throw deleteError;

    if (!runs.length) return;

    const rows = runs.map((run) => ({
      id: run.id,
      pipeline_name: run.pipeline_name,
      source_task_id: run.source_task_id,
      current_stage: run.current_stage,
      stage_status: run.stage_status,
      final_status: run.final_status,
      linked_task_ids: run.linked_task_ids ?? [],
      metadata: run.metadata ?? {},
      started_at: run.started_at ?? new Date().toISOString(),
      updated_at: run.updated_at ?? new Date().toISOString(),
    }));

    const { error } = await supabase.from("pipeline_runs").insert(rows);
    if (error) throw error;
  } catch (error) {
    logDbFallback("pipeline-runs.replacePipelineRuns", error);
  }
}
