import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTasks, getTaskLabel, isTaskStalled } from "@/lib/fs/tasks";
import { formatDateTime } from "@/lib/utils/time";

export default async function TasksPage() {
  const tasks = await getTasks();
  return (
    <PageShell title="Task queue" description="Shared queue monitor for ~/.openclaw/shared/tasks.json. In v1, filters/search can be added next; this view already handles empty state and highlights stalled tasks.">
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-zinc-400">No tasks in the queue yet.</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <Link key={task.id || `${getTaskLabel(task)}-${index}`} href={`/tasks/${task.id || `task-${index}`}`} className="block rounded-2xl border border-white/10 bg-zinc-900 p-5 hover:bg-white/[0.03]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-zinc-100">{getTaskLabel(task)}</div>
                  <div className="mt-1 text-sm text-zinc-400">Assigned to: {task.owner || "Unassigned"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={task.status || "queued"} />
                  {isTaskStalled(task) ? <StatusBadge value="blocked" /> : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-zinc-500 sm:grid-cols-3">
                <div>ID: {task.id || "—"}</div>
                <div>Created: {formatDateTime(task.createdAt)}</div>
                <div>Updated: {formatDateTime(task.updatedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
