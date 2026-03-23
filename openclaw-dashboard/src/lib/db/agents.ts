import type { AgentDetails } from "@/lib/types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAgentById as getFileAgentById, getAgents as getFileAgents } from "@/lib/fs/agents";
import { logDbFallback, maybeSelect } from "@/lib/db/utils";

export async function getDashboardAgents(): Promise<AgentDetails[]> {
  if (!hasSupabaseEnv()) return getFileAgents();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await maybeSelect<Record<string, unknown>>(supabase, "agents");
    if (error || !data || data.length === 0) throw error ?? new Error("No agent rows returned.");
    return getFileAgents();
  } catch (error) {
    logDbFallback("agents.getDashboardAgents", error);
    return getFileAgents();
  }
}

export async function getDashboardAgentById(agentId: string): Promise<AgentDetails | null> {
  const agents = await getDashboardAgents();
  return agents.find((agent) => agent.id === agentId) || (await getFileAgentById(agentId));
}

export async function replaceAgents(agents: AgentDetails[]) {
  if (!hasSupabaseEnv()) return;
  try {
    const supabase = createSupabaseAdminClient();
    const { error: deleteError } = await supabase.from("agents").delete().neq("id", "__never__");
    if (deleteError) throw deleteError;

    if (!agents.length) return;

    const rows = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji ?? null,
      workspace: agent.workspace,
      role_summary: agent.role ?? null,
      focus: agent.focus ?? null,
      trigger_type: agent.triggerType,
      status: agent.status,
      last_run_at: agent.lastRunTime ?? null,
      last_output_at: agent.lastOutputTime ?? null,
      latest_output_file: agent.latestOutputFile?.name ?? null,
      is_expected: agent.isExpected,
      is_registered: agent.isRegistered,
      metadata: {
        startupInstructions: agent.startupInstructions,
        schedule: agent.schedule ?? [],
        summary: agent.summary,
        expectedOutputs: agent.expectedOutputs,
        pendingTasks: agent.pendingTasks.map((task) => task.id ?? null),
        recentCompletedTasks: agent.recentCompletedTasks.map((task) => task.id ?? null),
      },
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("agents").insert(rows);
    if (error) throw error;
  } catch (error) {
    logDbFallback("agents.replaceAgents", error);
  }
}
