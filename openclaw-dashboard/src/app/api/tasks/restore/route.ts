import { NextRequest, NextResponse } from "next/server";
import { getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";
import { getArchivedTasks, saveArchivedTasks } from "@/lib/fs/tasks-archive";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const taskId = String(body.taskId || "");
  if (!taskId) return NextResponse.json({ ok: false, error: "taskId is required." }, { status: 400 });

  const tasks = await getTasks();
  const archived = await getArchivedTasks();
  const index = archived.findIndex((item, idx) => String(item.id || `task-${idx}`) === taskId);
  if (index < 0) return NextResponse.json({ ok: false, error: "Archived task not found." }, { status: 404 });

  const [task] = archived.splice(index, 1);
  task.status = 'queued';
  task.updatedAt = new Date().toISOString();
  task.statusHistory = [...normalizeStatusHistory(task), { status: 'queued', at: task.updatedAt, note: 'Restored from archive.' }];
  tasks.unshift(task);
  await saveTasks(tasks);
  await saveArchivedTasks(archived);
  return NextResponse.json({ ok: true });
}
