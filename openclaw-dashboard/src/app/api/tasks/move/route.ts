import { NextRequest, NextResponse } from "next/server";
import { getTasks, normalizeStatusHistory, saveTasks } from "@/lib/fs/tasks";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const taskId = String(body.taskId || "");
  const status = String(body.status || "");
  if (!taskId || !status) return NextResponse.json({ ok: false, error: "taskId and status are required." }, { status: 400 });

  const tasks = await getTasks();
  const task = tasks.find((item, index) => String(item.id || `task-${index}`) === taskId);
  if (!task) return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });

  task.status = status;
  task.updatedAt = new Date().toISOString();
  task.statusHistory = [
    ...normalizeStatusHistory(task),
    { status, at: task.updatedAt, note: "Moved manually from kanban board." },
  ];

  await saveTasks(tasks);
  return NextResponse.json({ ok: true, task });
}
