import { getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";
import type { TaskRecord } from "@/lib/types";
import { hoursSince } from "@/lib/utils/time";

const STALE_APPROVAL_HOURS = 48;
const STALE_BACKLOG_HOURS = 24 * 14;

export function isStaleApproval(task: TaskRecord) {
  return String(task.status || '') === 'needs_approval' && (hoursSince(task.updatedAt || task.createdAt) ?? 0) >= STALE_APPROVAL_HOURS;
}

export async function autoRetireSyntheticApprovalTasks() {
  const tasks = await getTasks();
  let changed = 0;
  for (const task of tasks) {
    const source = String(task.source || '');
    const title = String(task.title || task.description || '');
    if (isStaleApproval(task) && (/test|synthetic|verification/i.test(source) || /test|synthetic|verification/i.test(title))) {
      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      task.statusHistory = [...normalizeStatusHistory(task), { status: 'cancelled', at: task.updatedAt, note: 'Auto-retired stale synthetic approval task during hygiene sweep.' }];
      changed += 1;
    }
  }
  if (changed) await saveTasks(tasks);
  return changed;
}

export async function runQueueHygiene(action: 'cancel-stale-approval' | 'cancel-superseded-failed' | 'requeue-stalled' | 'retire-stale-backlog') {
  const tasks = await getTasks();
  let changed = 0;

  if (action === 'cancel-stale-approval') {
    for (const task of tasks) {
      if (isStaleApproval(task)) {
        task.status = 'cancelled';
        task.updatedAt = new Date().toISOString();
        task.statusHistory = [...normalizeStatusHistory(task), { status: 'cancelled', at: task.updatedAt, note: 'Cancelled during queue hygiene: stale approval task.' }];
        changed += 1;
      }
    }
  }

  if (action === 'cancel-superseded-failed') {
    for (const task of tasks) {
      if (String(task.status || '') === 'failed' && /superseded|obsolete|auto-restart/i.test(String(task.failureReason || task.description || ''))) {
        task.status = 'cancelled';
        task.updatedAt = new Date().toISOString();
        task.statusHistory = [...normalizeStatusHistory(task), { status: 'cancelled', at: task.updatedAt, note: 'Cancelled during queue hygiene: superseded failed task.' }];
        changed += 1;
      }
    }
  }

  if (action === 'requeue-stalled') {
    for (const task of tasks) {
      const age = hoursSince(task.updatedAt || task.createdAt) ?? 0;
      if (String(task.status || '') === 'queued' && age >= 24 * 7) {
        task.updatedAt = new Date().toISOString();
        task.statusHistory = [...normalizeStatusHistory(task), { status: 'queued', at: task.updatedAt, note: 'Touched during queue hygiene to re-acknowledge stale queued task.' }];
        changed += 1;
      }
    }
  }

  if (action === 'retire-stale-backlog') {
    for (const task of tasks) {
      const age = hoursSince(task.updatedAt || task.createdAt) ?? 0;
      if (String(task.status || '') !== 'queued' || age < STALE_BACKLOG_HOURS) continue;
      task.status = 'cancelled';
      task.updatedAt = new Date().toISOString();
      task.statusHistory = [...normalizeStatusHistory(task), { status: 'cancelled', at: task.updatedAt, note: 'Cancelled during queue hygiene: long-lived queued backlog item retired to reduce persistent stale-task noise.' }];
      changed += 1;
    }
  }

  if (changed) await saveTasks(tasks);
  return changed;
}
