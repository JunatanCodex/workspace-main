"use client";

import Link from "next/link";
import type { TaskRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTaskLabelView, isTaskFailedView, isTaskStalledView } from "@/lib/utils/task-view";
import { formatCalendarDateTime, hoursSince } from "@/lib/utils/time";

export function TaskCard({ task, href, onDragStart }: { task: TaskRecord; href: string; onDragStart: (taskId: string) => void }) {
  const stalled = isTaskStalledView(task);
  const failed = isTaskFailedView(task);
  const staleHours = hoursSince(task.updatedAt || task.createdAt);
  const taskId = String(task.id || "");

  return (
    <div
      draggable
      onDragStart={() => onDragStart(taskId)}
      className={`rounded-2xl border p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.01)] transition hover:-translate-y-0.5 hover:bg-white/[0.03] cursor-grab active:cursor-grabbing ${failed ? "border-red-500/20 bg-red-500/[0.05]" : stalled ? "border-amber-500/20 bg-amber-500/[0.05]" : "border-white/8 bg-zinc-950/80"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={href} className="font-medium text-zinc-100 hover:text-white">{getTaskLabelView(task)}</Link>
          <div className="mt-1 text-xs text-zinc-500">{taskId || '—'}</div>
        </div>
        <StatusBadge value={task.status || 'queued'} />
      </div>
      <div className="mt-3 text-sm text-zinc-400">{task.owner || 'Unassigned'}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {stalled ? <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">stalled {staleHours ? `~${Math.round(staleHours)}h` : ""}</span> : null}
        {failed ? <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300">failure</span> : null}
      </div>
      <div className="mt-3 text-xs text-zinc-500">Updated {formatCalendarDateTime(task.updatedAt)}</div>
    </div>
  );
}
