"use server";

import { revalidatePath } from "next/cache";
import type { TaskRecord } from "@/lib/types";
import { createTaskId, getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";

function nowIso() {
  return new Date().toISOString();
}

export async function createTaskAction(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const owner = String(formData.get("owner") || "").trim();
  const priority = String(formData.get("priority") || "medium").trim();
  const context = String(formData.get("context") || "").trim();

  if (!title && !description) {
    throw new Error("Task title or description is required.");
  }

  const tasks = await getTasks();
  const task: TaskRecord = {
    id: createTaskId(),
    title: title || undefined,
    description: description || undefined,
    owner: owner || undefined,
    priority,
    context: context || undefined,
    status: "queued",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    source: "dashboard",
    statusHistory: [{ status: "queued", at: nowIso(), note: "Created from dashboard." }],
  };

  tasks.unshift(task);
  await saveTasks(tasks);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/agents");
  revalidatePath("/alerts");
}

export async function requeueTaskAction(formData: FormData) {
  const id = String(formData.get("taskId") || "").trim();
  if (!id) throw new Error("Task ID is required.");

  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error("Task not found.");

  task.status = "queued";
  task.updatedAt = nowIso();
  task.failureReason = undefined;
  task.statusHistory = [
    ...normalizeStatusHistory(task),
    { status: "queued", at: nowIso(), note: "Requeued from dashboard." },
  ];

  await saveTasks(tasks);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/alerts");
}

export async function markApprovalAction(formData: FormData) {
  const id = String(formData.get("taskId") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  if (!id) throw new Error("Task ID is required.");

  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error("Task not found.");

  task.status = "needs_approval";
  task.updatedAt = nowIso();
  task.needsApprovalReason = reason || "Marked for approval review from dashboard.";
  task.statusHistory = [
    ...normalizeStatusHistory(task),
    { status: "needs_approval", at: nowIso(), note: task.needsApprovalReason },
  ];

  await saveTasks(tasks);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  revalidatePath("/alerts");
}
