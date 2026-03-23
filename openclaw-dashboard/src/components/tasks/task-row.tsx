import Link from "next/link";
import type { TaskRecord } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTaskLabel, isTaskFailed, isTaskStalled } from "@/lib/fs/tasks";
import { formatDateTime, hoursSince } from "@/lib/utils/time";

export function TaskRow({ task, href, duplicate = false }: { task: TaskRecord; href: string; duplicate?: boolean }) {
  const stalled = isTaskStalled(task);
  const failed = isTaskFailed(task);
  const staleHours = hoursSince(task.updatedAt || task.createdAt);
  return (
    <Link
      href={href}
      className={`grid gap-4 rounded-2xl border p-4 transition hover:bg-white/[0.03] lg:grid-cols-[1.8fr_0.9fr_0.8fr_0.8fr] ${failed ? "border-red-500/20 bg-red-500/[0.05]" : stalled ? "border-amber-500/20 bg-amber-500/[0.05]" : duplicate ? "border-violet-500/20 bg-violet-500/[0.04]" : "border-white/8 bg-zinc-950/80"}`}
    >
      <div>
        <div className="font-medium text-zinc-100">{getTaskLabel(task)}</div>
        <div className="mt-1 text-sm text-zinc-500">ID: {task.id || "—"}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {stalled ? <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-300">stalled {staleHours ? `~${Math.round(staleHours)}h` : ""}</span> : null}
          {failed ? <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] text-red-300">failure</span> : null}
          {duplicate ? <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-300">possible duplicate</span> : null}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Assigned</div>
        <div className="mt-2 text-sm text-zinc-200">{task.owner || "Unassigned"}</div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Status</div>
        <div className="mt-2"><StatusBadge value={task.status || "queued"} /></div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Updated</div>
        <div className="mt-2 text-sm text-zinc-200">{formatDateTime(task.updatedAt)}</div>
      </div>
    </Link>
  );
}
