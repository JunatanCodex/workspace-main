"use client";

import { useMemo, useState } from "react";
import type { TaskRecord } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TaskCard } from "@/components/tasks/task-card";
import { formatTime } from "@/lib/utils/time";
import { useLiveJson } from "@/hooks/use-live-json";

const COLUMNS = [
  { key: 'queued', label: 'Queued' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'needs_approval', label: 'Needs Approval' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
  { key: 'failed', label: 'Failed' },
];

export function KanbanBoard({ initialTasks, filteredTasks }: { initialTasks: TaskRecord[]; filteredTasks: TaskRecord[] }) {
  const { data, updatedAt } = useLiveJson<{ tasks: TaskRecord[]; updatedAt: string }>("/api/tasks", { tasks: initialTasks, updatedAt: new Date().toISOString() });
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const tasks = filteredTasks.length === initialTasks.length ? data.tasks || initialTasks : filteredTasks;

  const grouped = useMemo(() => {
    const map = new Map<string, TaskRecord[]>();
    for (const column of COLUMNS) map.set(column.key, []);
    for (const task of tasks) {
      const status = String(task.status || 'queued');
      if (!map.has(status)) map.set(status, []);
      map.get(status)!.push(task);
    }
    return map;
  }, [tasks]);

  async function move(status: string) {
    if (!dragTaskId) return;
    const response = await fetch('/api/tasks/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: dragTaskId, status }),
    });
    const json = await response.json();
    setMessage(response.ok ? `Moved task to ${status}.` : json.error || 'Move failed.');
    setDragTaskId(null);
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <SectionHeader title="Task board" description={`${tasks.length} visible task(s) · live updated ${formatTime(updatedAt)} · drag cards between status columns`} />
      {message ? <div className="mb-4 text-sm text-zinc-400">{message}</div> : null}
      {tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="The shared queue is empty or your current filters excluded all tasks." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2">
          {COLUMNS.map((column) => (
            <div key={column.key} onDragOver={(e) => e.preventDefault()} onDrop={() => move(column.key)} className="min-h-[360px] rounded-2xl border border-white/8 bg-black/20 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-100">{column.label}</div>
                <div className="rounded-full bg-white/6 px-2 py-1 text-xs text-zinc-400">{grouped.get(column.key)?.length || 0}</div>
              </div>
              <div className="space-y-3">
                {(grouped.get(column.key) || []).map((task, index) => (
                  <TaskCard key={String(task.id || `${column.key}-${index}`)} task={task} href={`/tasks/${task.id || `task-${index}`}`} onDragStart={setDragTaskId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
