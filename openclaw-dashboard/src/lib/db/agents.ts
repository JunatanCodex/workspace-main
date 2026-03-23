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
