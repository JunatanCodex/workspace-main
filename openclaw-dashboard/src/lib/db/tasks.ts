import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TaskRecord } from "@/lib/types";
import type { AppRole } from "@/lib/auth/roles";
import type { DbTaskEventRow, DbTaskRow } from "@/lib/db/types";
import { logDbFallback, maybeSelect } from "@/lib/db/utils";
import { getTasks as getFileTasks } from "@/lib/fs/tasks";

function mapTaskRow(row: DbTaskRow): TaskRecord {
  return {
    id: row.id,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    owner: row.owner_agent_id ?? undefined,
    status: row.status ?? undefined,
    priority: row.priority ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
    source: row.source ?? undefined,
    context: row.context ?? undefined,
    notes: row.notes ?? undefined,
    needsApprovalReason: row.needs_approval_reason ?? undefined,
    failureReason: row.failure_reason ?? undefined,
  };
}

export async function getDashboardTasks(): Promise<TaskRecord[]> {
  if (!hasSupabaseEnv()) return getFileTasks();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await maybeSelect<DbTaskRow>(supabase, "tasks");
    if (error || !data) throw error ?? new Error("No task rows returned.");
    return data.map(mapTaskRow).sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
  } catch (error) {
    logDbFallback("tasks.getDashboardTasks", error);
    return getFileTasks();
  }
}

export async function getDashboardTaskById(taskId: string): Promise<TaskRecord | null> {
  const tasks = await getDashboardTasks();
  return tasks.find((task) => task.id === taskId) || null;
}

export async function appendTaskEvent(event: DbTaskEventRow) {
  if (!hasSupabaseEnv()) return;
  try {
    const supabase = createSupabaseAdminClient();
    const error = await supabase.from("task_events").insert(event).then((result) => result.error);
    if (error) throw error;
  } catch (error) {
    logDbFallback("tasks.appendTaskEvent", error);
  }
}

export async function mirrorTaskMutation(task: TaskRecord, actor: { userId: string; role: AppRole }) {
  if (!hasSupabaseEnv() || !task.id) return;
  try {
    const supabase = createSupabaseAdminClient();
    const payload = {
      id: String(task.id),
      title: task.title ?? null,
      description: task.description ?? null,
      owner_agent_id: task.owner ?? null,
      status: task.status ?? null,
      priority: task.priority ?? null,
      source: task.source ?? null,
      context: (task.context as Record<string, unknown> | string[] | string | undefined) ?? null,
      notes: (task.notes as Record<string, unknown> | string[] | string | undefined) ?? null,
      needs_approval_reason: task.needsApprovalReason ?? null,
      failure_reason: task.failureReason ?? null,
      created_at: task.createdAt ?? new Date().toISOString(),
      updated_at: task.updatedAt ?? new Date().toISOString(),
      updated_by: actor.userId,
      created_by: actor.userId,
    };
    const { error } = await supabase.from("tasks").upsert(payload);
    if (error) throw error;
  } catch (error) {
    logDbFallback("tasks.mirrorTaskMutation", error);
  }
}
