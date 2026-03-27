import { NextRequest, NextResponse } from "next/server";
import { getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";
import { getArchivedTasks, saveArchivedTasks } from "@/lib/fs/tasks-archive";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const taskId = String(body.taskId || "");
  if (!taskId) return NextResponse.json({ ok: false, error: "taskId is required." }, { status: 400 });

  const tasks = await getTasks();
  const archived = await getArchivedTasks();
  const index = tasks.findIndex((item, idx) => String(item.id || `task-${idx}`) === taskId);
  if (index < 0) return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });

  const [task] = tasks.splice(index, 1);
  task.statusHistory = [...normalizeStatusHistory(task), { status: 'archived', at: new Date().toISOString(), note: 'Archived manually from task detail.' }];
  archived.unshift(task);
  await saveTasks(tasks);
  await saveArchivedTasks(archived);
  return NextResponse.json({ ok: true });
}
