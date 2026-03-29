import type { TaskRecord } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";

export function getTaskLabelView(task: TaskRecord): string {
  return task.title || task.description || task.id || "Untitled task";
}

export function isTaskFailedView(task: TaskRecord): boolean {
  const status = String(task.status || "").toLowerCase();
  return status === "failed" || status === "error" || Boolean(task.failureReason);
}

export function isTaskBacklogView(task: TaskRecord): boolean {
  const status = task.status ?? "queued";
  const since = hoursSince(task.updatedAt || task.createdAt);
  if (since === null) return false;
  return status === "queued" && since > 24;
}

export function isTaskStalledView(task: TaskRecord): boolean {
  const status = task.status ?? "queued";
  const since = hoursSince(task.updatedAt || task.createdAt);
  if (since === null) return false;
  if (status === "in_progress") return since > 12;
  return false;
}
