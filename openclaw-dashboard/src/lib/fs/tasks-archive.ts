import { promises as fs } from "node:fs";
import { ARCHIVED_TASKS_FILE, TASKS_FILE } from "@/lib/config";
import type { TaskRecord } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";
import { readJsonIfExists } from "./safe-read";

const ARCHIVE_AFTER_HOURS = 72;

export async function getArchivedTasks(): Promise<TaskRecord[]> {
  const tasks = await readJsonIfExists<TaskRecord[]>(ARCHIVED_TASKS_FILE, []);
  return Array.isArray(tasks) ? tasks : [];
}

export async function saveArchivedTasks(tasks: TaskRecord[]): Promise<void> {
  await fs.writeFile(ARCHIVED_TASKS_FILE, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
}

export async function autoArchiveDoneTasks(tasks: TaskRecord[]): Promise<TaskRecord[]> {
  const archived = await getArchivedTasks();
  const keep: TaskRecord[] = [];
  const move: TaskRecord[] = [];

  for (const task of tasks) {
    const status = String(task.status || 'queued');
    const age = hoursSince(task.updatedAt || task.createdAt);
    if (status === 'done' && age !== null && age >= ARCHIVE_AFTER_HOURS) {
      move.push({
        ...task,
        statusHistory: [
          ...(Array.isArray(task.statusHistory) ? task.statusHistory : []),
          { status: 'archived', at: new Date().toISOString(), note: 'Auto-archived after 3 days in done.' },
        ],
      });
    } else {
      keep.push(task);
    }
  }

  if (move.length) {
    await saveArchivedTasks([...move, ...archived]);
    await fs.writeFile(TASKS_FILE, `${JSON.stringify(keep, null, 2)}\n`, 'utf8');
  }

  return keep;
}
