import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArchiveNowButton } from "@/components/tasks/archive-controls";
import { ApprovalSubmitButton, RequeueSubmitButton } from "@/components/tasks/task-detail-actions";
import { markApprovalAction, requeueTaskAction } from "@/lib/actions/tasks";
import { getTasks, getTaskLabel } from "@/lib/fs/tasks";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const tasks = await getTasks();
  const task = tasks.find((item) => item.id === taskId) || tasks.find((item, index) => `task-${index}` === taskId);

  return (
    <PageShell title={task ? getTaskLabel(task) : "Task not found"} description="A GitHub-issue-style task view with clear status, context, approval state, and raw payload visibility.">
      {!task ? (
        <EmptyState title="Task not found" description="No matching task was found in the shared queue." />
      ) : (
        <div className="space-y-6">
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
              <SectionHeader title="Task status" description="Current state, owner, and key task metadata." />
              <div className="flex items-center gap-2"><StatusBadge value={task.status || "queued"} /></div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="text-zinc-500">Task ID</dt><dd className="mt-1 text-zinc-200">{task.id || "—"}</dd></div>
                <div><dt className="text-zinc-500">Assigned agent</dt><dd className="mt-1 text-zinc-200">{task.owner || "Unassigned"}</dd></div>
                <div><dt className="text-zinc-500">Created</dt><dd className="mt-1 text-zinc-200">{task.createdAt || "—"}</dd></div>
                <div><dt className="text-zinc-500">Updated</dt><dd className="mt-1 text-zinc-200">{task.updatedAt || "—"}</dd></div>
                <div><dt className="text-zinc-500">Approval reason</dt><dd className="mt-1 text-zinc-200">{task.needsApprovalReason || "—"}</dd></div>
                <div><dt className="text-zinc-500">Failure reason</dt><dd className="mt-1 text-zinc-200">{task.failureReason || "—"}</dd></div>
              </dl>
              {task.owner ? <div className="mt-4"><Link href={`/agents/${task.owner}`} className="text-sm text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white">Open assigned agent</Link></div> : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <form action={requeueTaskAction} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
                <SectionHeader title="Requeue" description="Move the task back to queued and append status history." />
                <input type="hidden" name="taskId" value={String(task.id || "")} />
                <RequeueSubmitButton />
              </form>

              <form action={markApprovalAction} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
                <SectionHeader title="Mark needs approval" description="Escalate this task with a clear approval note." />
                <input type="hidden" name="taskId" value={String(task.id || "")} />
                <textarea name="reason" rows={4} placeholder="Reason for approval review" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
                <div className="mt-4"><ApprovalSubmitButton /></div>
              </form>

              {String(task.status || '') === 'done' ? (
                <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
                  <SectionHeader title="Archive now" description="Move this completed task out of the active board immediately." />
                  <ArchiveNowButton taskId={String(task.id || '')} />
                </div>
              ) : null}
            </div>
          </section>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
              <SectionHeader title="Full payload" description="Raw task object for debugging and inspection." />
              <pre className="overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-4 text-xs text-zinc-300">{JSON.stringify(task, null, 2)}</pre>
            </div>

            <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
              <SectionHeader title="Status history" description="Shows all recorded status transitions when available." />
              {Array.isArray(task.statusHistory) && task.statusHistory.length ? (
                <div className="space-y-3">
                  {task.statusHistory.map((entry, index) => (
                    <div key={`${entry.status}-${entry.at || index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <StatusBadge value={entry.status} />
                        <div className="text-xs text-zinc-500">{entry.at || "—"}</div>
                      </div>
                      {entry.note ? <div className="mt-2 text-sm text-zinc-300">{entry.note}</div> : null}
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No status history" description="This task does not yet have structured history entries." />}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
