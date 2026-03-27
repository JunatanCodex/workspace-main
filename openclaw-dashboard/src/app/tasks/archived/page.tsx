import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { RestoreTaskButton } from "@/components/tasks/archive-controls";
import { getArchivedTasks } from "@/lib/fs/tasks-archive";
import { getTaskLabelView } from "@/lib/utils/task-view";
import { hoursSince } from "@/lib/utils/time";

function pickValues(values: string | string[] | undefined): string[] {
  if (!values) return [];
  return Array.isArray(values) ? values : [values];
}

export default async function ArchivedTasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const statusFilter = pickValues(params.status)[0] || 'all';
  const ownerFilter = pickValues(params.owner)[0] || 'all';
  const dateFilter = pickValues(params.date)[0] || 'all';
  const tasks = await getArchivedTasks();
  const owners = Array.from(new Set(tasks.map((task) => task.owner).filter(Boolean))) as string[];
  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || String(task.status || 'archived') === statusFilter || statusFilter === 'archived';
    const matchesOwner = ownerFilter === 'all' || String(task.owner || '') === ownerFilter;
    const ageHours = hoursSince(task.updatedAt || task.createdAt);
    const matchesDate = dateFilter === 'all' || ageHours === null || (dateFilter === 'week' && ageHours <= 24 * 7) || (dateFilter === 'month' && ageHours <= 24 * 30);
    return matchesStatus && matchesOwner && matchesDate;
  });

  return (
    <PageShell title="Archived tasks" description="Completed tasks that have been auto-archived off the active board after a few days." actions={<Link href="/tasks" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">← Back to Tasks</Link>}>
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Archive filters" description="Filter archived tasks by owner and recency." />
        <form className="grid gap-3 md:grid-cols-[220px_220px_220px_auto]">
          <select name="status" defaultValue={statusFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">All statuses</option>
            <option value="archived">Archived</option>
            <option value="done">Done</option>
          </select>
          <select name="owner" defaultValue={ownerFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">All agents</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <select name="date" defaultValue={dateFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">Any time</option>
            <option value="week">Updated this week</option>
            <option value="month">Updated this month</option>
          </select>
          <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Apply</button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Archive" description={`${filtered.length} archived task(s)`} />
        {filtered.length === 0 ? <EmptyState title="No archived tasks" description="Done tasks older than ~3 days will appear here automatically." /> : (
          <div className="space-y-4">
            {filtered.map((task, index) => (
              <div key={task.id || `${getTaskLabelView(task)}-${index}`} className="space-y-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                <TaskRow task={task} href={`/tasks/${task.id || `task-${index}`}`} />
                <RestoreTaskButton taskId={String(task.id || `task-${index}`)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
