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
