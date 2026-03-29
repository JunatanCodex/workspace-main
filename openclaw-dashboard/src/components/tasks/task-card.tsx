"use client";

import Link from "next/link";
import type { TaskRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTaskLabelView, isTaskBacklogView, isTaskFailedView, isTaskStalledView } from "@/lib/utils/task-view";
import { formatCalendarDateTime, hoursSince } from "@/lib/utils/time";

export function TaskCard({ task, href, onDragStart }: { task: TaskRecord; href: string; onDragStart: (taskId: string) => void }) {
  const stalled = isTaskStalledView(task);
  const backlog = isTaskBacklogView(task);
  const failed = isTaskFailedView(task);
  const staleHours = hoursSince(task.updatedAt || task.createdAt);
  const taskId = String(task.id || "");

  return (
    <div
      draggable
      onDragStart={() => onDragStart(taskId)}
      className={`rounded-2xl border p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] transition hover:-translate-y-0.5 hover:bg-white/[0.03] cursor-grab active:cursor-grabbing ${failed ? "border-red-500/20 bg-red-500/[0.05]" : stalled ? "border-amber-500/20 bg-amber-500/[0.05]" : backlog ? "border-white/10 bg-white/[0.02]" : "border-white/8 bg-zinc-950/80"}`}
    >
      <div className="mb-2">
        <StatusBadge value={task.status || 'queued'} />
      </div>
      <div>
        <Link href={href} className="block break-words text-sm font-medium text-zinc-100 hover:text-white">{getTaskLabelView(task)}</Link>
        <div className="mt-1 text-[11px] text-zinc-500 break-all">{taskId || '—'}</div>
      </div>
      <div className="mt-2 text-xs text-zinc-400">{task.owner || 'Unassigned'}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {stalled ? <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">stalled {staleHours ? `~${Math.round(staleHours)}h` : ""}</span> : null}
        {!stalled && backlog ? <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">backlog {staleHours ? `~${Math.round(staleHours)}h` : ""}</span> : null}
        {failed ? <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">failure</span> : null}
      </div>
      <div className="mt-2 text-[11px] text-zinc-500">Updated {formatCalendarDateTime(task.updatedAt)}</div>
    </div>
  );
}
