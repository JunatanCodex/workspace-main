import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { getTasks } from "@/lib/fs/tasks";
import { hoursSince } from "@/lib/utils/time";
import { KanbanBoard } from "@/components/tasks/kanban-board";

function pickValues(values: string | string[] | undefined): string[] {
  if (!values) return [];
  return Array.isArray(values) ? values : [values];
}

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const statusFilter = pickValues(params.status)[0] || "all";
  const ownerFilter = pickValues(params.owner)[0] || "all";
  const dateFilter = pickValues(params.date)[0] || "all";
  const query = (pickValues(params.q)[0] || "").toLowerCase();

  const tasks = await getTasks();
  const owners = Array.from(new Set(tasks.map((task) => task.owner).filter(Boolean))) as string[];
  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || String(task.status || "queued") === statusFilter;
    const matchesOwner = ownerFilter === "all" || String(task.owner || "") === ownerFilter;
    const haystack = JSON.stringify(task).toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const ageHours = hoursSince(task.updatedAt || task.createdAt);
    const matchesDate =
      dateFilter === "all" ||
      ageHours === null ||
      (dateFilter === "today" && ageHours <= 24) ||
      (dateFilter === "week" && ageHours <= 24 * 7);
    return matchesStatus && matchesOwner && matchesQuery && matchesDate;
  });

  return (
    <PageShell title="Task queue" description="A Linear-style issue view for your shared agent queue: searchable, filterable, and now polling-backed for live operational monitoring.">
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Filters" description="Search and refine the shared task queue by status, agent, and recency." />
        <form className="grid gap-3 md:grid-cols-[1fr_220px_220px_220px_auto]">
          <input name="q" defaultValue={query} placeholder="Search tasks" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
          <select name="status" defaultValue={statusFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">All statuses</option>
            {Array.from(new Set(tasks.map((task) => String(task.status || "queued")))).map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select name="owner" defaultValue={ownerFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">All agents</option>
            {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
          <select name="date" defaultValue={dateFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
            <option value="all">Any time</option>
            <option value="today">Updated today</option>
            <option value="week">Updated this week</option>
          </select>
          <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Apply</button>
        </form>
      </section>

      <KanbanBoard initialTasks={tasks} filteredTasks={filtered} />
    </PageShell>
  );
}
