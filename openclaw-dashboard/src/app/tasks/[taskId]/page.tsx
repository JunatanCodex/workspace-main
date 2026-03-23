import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTasks, getTaskLabel } from "@/lib/fs/tasks";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === taskId) || tasks.find((item, index) => `task-${index}` === taskId);

  return (
    <PageShell title={task ? getTaskLabel(task) : "Task not found"} description="Task detail view from the shared queue. Related outputs/logs will be strengthened as the system starts producing more runtime artifacts.">
      {!task ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-zinc-400">No matching task was found.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <div className="flex items-center gap-2"><StatusBadge value={task.status || "queued"} /></div>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-zinc-500">Task ID</dt><dd className="text-zinc-200">{task.id || "—"}</dd></div>
              <div><dt className="text-zinc-500">Assigned agent</dt><dd className="text-zinc-200">{task.owner || "Unassigned"}</dd></div>
              <div><dt className="text-zinc-500">Created</dt><dd className="text-zinc-200">{task.createdAt || "—"}</dd></div>
              <div><dt className="text-zinc-500">Updated</dt><dd className="text-zinc-200">{task.updatedAt || "—"}</dd></div>
              <div><dt className="text-zinc-500">Needs approval reason</dt><dd className="text-zinc-200">{task.needsApprovalReason || "—"}</dd></div>
              <div><dt className="text-zinc-500">Failure reason</dt><dd className="text-zinc-200">{task.failureReason || "—"}</dd></div>
            </dl>
          </section>
          <section className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
            <h2 className="text-lg font-semibold text-zinc-50">Full task payload</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-zinc-300">{JSON.stringify(task, null, 2)}</pre>
          </section>
        </div>
      )}
    </PageShell>
  );
}
