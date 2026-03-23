"use server";

import { revalidatePath } from "next/cache";
import type { TaskRecord } from "@/lib/types";
import { createTaskId, getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";
import { requireOperationalAccess } from "@/lib/auth/guard";
import { appendTaskEvent, mirrorTaskMutation } from "@/lib/db/tasks";

function nowIso() {
  return new Date().toISOString();
}

export async function createTaskAction(formData: FormData) {
  const session = await requireOperationalAccess();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const owner = String(formData.get("owner") || "").trim();
  const priority = String(formData.get("priority") || "medium").trim();
  const context = String(formData.get("context") || "").trim();

  if (!title && !description) {
    throw new Error("Task title or description is required.");
  }

  const tasks = await getTasks();
  const createdAt = nowIso();
  const task: TaskRecord = {
    id: createTaskId(),
    title: title || undefined,
    description: description || undefined,
    owner: owner || undefined,
    priority,
    context: context || undefined,
    status: "queued",
    createdAt,
    updatedAt: createdAt,
    source: "dashboard",
    statusHistory: [{ status: "queued", at: createdAt, note: "Created from dashboard." }],
  };

  tasks.unshift(task);
  await saveTasks(tasks);
  await mirrorTaskMutation(task, { userId: session.user.id, role: session.profile.role });
  await appendTaskEvent({
    task_id: String(task.id),
    event_type: "created",
    to_status: "queued",
    note: "Created from dashboard.",
    actor_user_id: session.user.id,
    actor_role: session.profile.role,
    metadata: { owner: task.owner ?? null, priority: task.priority ?? null },
  });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/agents");
  revalidatePath("/alerts");
}

export async function requeueTaskAction(formData: FormData) {
  const session = await requireOperationalAccess();
  const id = String(formData.get("taskId") || "").trim();
  if (!id) throw new Error("Task ID is required.");

  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error("Task not found.");

  const fromStatus = String(task.status || "queued");
  task.status = "queued";
  task.updatedAt = nowIso();
  task.failureReason = undefined;
  task.statusHistory = [
    ...normalizeStatusHistory(task),
    { status: "queued", at: nowIso(), note: "Requeued from dashboard." },
  ];

  await saveTasks(tasks);
  await mirrorTaskMutation(task, { userId: session.user.id, role: session.profile.role });
  await appendTaskEvent({
    task_id: String(task.id),
    event_type: "requeued",
    from_status: fromStatus,
    to_status: "queued",
    note: "Requeued from dashboard.",
    actor_user_id: session.user.id,
    actor_role: session.profile.role,
  });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/alerts");
}

export async function markApprovalAction(formData: FormData) {
  const session = await requireOperationalAccess();
  const id = String(formData.get("taskId") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!id) throw new Error("Task ID is required.");

  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error("Task not found.");

  const fromStatus = String(task.status || "queued");
  task.status = "needs_approval";
  task.updatedAt = nowIso();
  task.needsApprovalReason = reason || "Marked for approval review from dashboard.";
  task.statusHistory = [
    ...normalizeStatusHistory(task),
    { status: "needs_approval", at: nowIso(), note: task.needsApprovalReason },
  ];

  await saveTasks(tasks);
  await mirrorTaskMutation(task, { userId: session.user.id, role: session.profile.role });
  await appendTaskEvent({
    task_id: String(task.id),
    event_type: "marked_needs_approval",
    from_status: fromStatus,
    to_status: "needs_approval",
    note: task.needsApprovalReason,
    actor_user_id: session.user.id,
    actor_role: session.profile.role,
  });
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/alerts");
}
