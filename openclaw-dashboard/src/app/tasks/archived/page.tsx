import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { getArchivedTasks } from "@/lib/fs/tasks-archive";
import { getTaskLabelView } from "@/lib/utils/task-view";

export default async function ArchivedTasksPage() {
  const tasks = await getArchivedTasks();
  return (
    <PageShell title="Archived tasks" description="Completed tasks that have been auto-archived off the active board after a few days.">
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Archive" description={`${tasks.length} archived task(s)`} />
        {tasks.length === 0 ? <EmptyState title="No archived tasks" description="Done tasks older than ~3 days will appear here automatically." /> : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskRow key={task.id || `${getTaskLabelView(task)}-${index}`} task={task} href={`/tasks/${task.id || `task-${index}`}`} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
