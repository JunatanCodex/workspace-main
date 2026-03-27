"use client";

import { useMemo, useState } from "react";
import type { TaskRecord } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TaskCard } from "@/components/tasks/task-card";
import { formatTime } from "@/lib/utils/time";
import { useLiveJson } from "@/hooks/use-live-json";

const COLUMNS = [
  { key: 'queued', label: 'Queued', accent: 'border-sky-500/20 bg-sky-500/10 text-sky-200', hint: 'Ready to start' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-violet-500/20 bg-violet-500/10 text-violet-200', hint: 'Active work' },
  { key: 'needs_approval', label: 'Needs Approval', accent: 'border-amber-500/20 bg-amber-500/10 text-amber-200', hint: 'Waiting on human review' },
  { key: 'blocked', label: 'Blocked', accent: 'border-orange-500/20 bg-orange-500/10 text-orange-200', hint: 'Externally blocked' },
  { key: 'failed', label: 'Failed', accent: 'border-red-500/20 bg-red-500/10 text-red-200', hint: 'Needs intervention' },
  { key: 'done', label: 'Done', accent: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200', hint: 'Completed items' },
];

export function KanbanBoard({ initialTasks, filteredTasks }: { initialTasks: TaskRecord[]; filteredTasks: TaskRecord[] }) {
  const { data, updatedAt } = useLiveJson<{ tasks: TaskRecord[]; updatedAt: string }>("/api/tasks", { tasks: initialTasks, updatedAt: new Date().toISOString() });
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hoverColumn, setHoverColumn] = useState<string | null>(null);
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
    setHoverColumn(null);
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <SectionHeader title="Task board" description={`${tasks.length} visible task(s) · live updated ${formatTime(updatedAt)} · drag cards between status columns`} />
      {message ? <div className="mb-4 text-sm text-zinc-400">{message}</div> : null}
      {tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="The shared queue is empty or your current filters excluded all tasks." />
      ) : (
        <div className="grid gap-4 2xl:grid-cols-6 xl:grid-cols-3 md:grid-cols-2">
          {COLUMNS.map((column) => {
            const count = grouped.get(column.key)?.length || 0;
            return (
              <div
                key={column.key}
                onDragOver={(e) => { e.preventDefault(); setHoverColumn(column.key); }}
                onDragLeave={() => setHoverColumn((current) => current === column.key ? null : current)}
                onDrop={() => move(column.key)}
                className={`min-h-[420px] rounded-2xl border p-3 transition ${hoverColumn === column.key ? 'border-white/20 bg-white/[0.05]' : 'border-white/8 bg-black/20'}`}
              >
                <div className={`mb-3 rounded-xl border px-3 py-3 ${column.accent}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{column.label}</div>
                      <div className="mt-1 text-[11px] opacity-80">{column.hint}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-white/80">{count} WIP</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {(grouped.get(column.key) || []).map((task, index) => (
                    <TaskCard key={String(task.id || `${column.key}-${index}`)} task={task} href={`/tasks/${task.id || `task-${index}`}`} onDragStart={setDragTaskId} />
                  ))}
                  {count === 0 ? <div className="rounded-xl border border-dashed border-white/8 px-3 py-6 text-center text-xs text-zinc-500">Drop tasks here</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
