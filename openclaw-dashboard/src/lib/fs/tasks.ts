import { promises as fs } from "node:fs";
import { TASKS_FILE, STALLED_IN_PROGRESS_HOURS, STALLED_QUEUED_HOURS } from "@/lib/config";
import type { TaskRecord } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";
import { autoArchiveDoneTasks } from "./tasks-archive";
import { readJsonIfExists } from "./safe-read";

export async function getTasks(): Promise<TaskRecord[]> {
  const tasks = await readJsonIfExists<TaskRecord[]>(TASKS_FILE, []);
  const rows = Array.isArray(tasks) ? tasks : [];
  return autoArchiveDoneTasks(rows);
}

export async function saveTasks(tasks: TaskRecord[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, `${JSON.stringify(tasks, null, 2)}\n`, "utf8");
}

export function getTaskLabel(task: TaskRecord): string {
  return task.title || task.description || task.id || "Untitled task";
}

export function isTaskStalled(task: TaskRecord): boolean {
  const status = task.status ?? "queued";
  const since = hoursSince(task.updatedAt || task.createdAt);
  if (since === null) return false;
  if (status === "queued") return since > STALLED_QUEUED_HOURS;
  if (status === "in_progress") return since > STALLED_IN_PROGRESS_HOURS;
  return false;
}

export function isTaskFailed(task: TaskRecord): boolean {
  const status = (task.status || "").toLowerCase();
  return status === "failed" || status === "error" || Boolean(task.failureReason);
}

export function createTaskId(): string {
  return `task_${Date.now()}`;
}

export function normalizeStatusHistory(task: TaskRecord): NonNullable<TaskRecord["statusHistory"]> {
  return Array.isArray(task.statusHistory) ? task.statusHistory : [];
}
