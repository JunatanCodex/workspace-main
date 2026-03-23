import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { getTasks, getTaskLabel, isTaskStalled } from "@/lib/fs/tasks";
import { formatDateTime } from "@/lib/utils/time";

function pickValues(values: string | string[] | undefined): string[] {
  if (!values) return [];
  return Array.isArray(values) ? values : [values];
}

export default async function TasksPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) || {};
  const statusFilter = pickValues(params.status)[0] || "all";
  const ownerFilter = pickValues(params.owner)[0] || "all";
  const query = (pickValues(params.q)[0] || "").toLowerCase();

  const tasks = await getTasks();
  const owners = Array.from(new Set(tasks.map((task) => task.owner).filter(Boolean))) as string[];
  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || String(task.status || "queued") === statusFilter;
    const matchesOwner = ownerFilter === "all" || String(task.owner || "") === ownerFilter;
    const haystack = JSON.stringify(task).toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesStatus && matchesOwner && matchesQuery;
  });

  return (
    <PageShell title="Task queue" description="Shared queue monitor for ~/.openclaw/shared/tasks.json with lightweight filters and keyword search.">
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-zinc-900 p-4 md:grid-cols-[1fr_220px_220px_auto]">
        <input name="q" defaultValue={query} placeholder="Search by keyword" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
        <select name="status" defaultValue={statusFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
          <option value="all">All statuses</option>
          {Array.from(new Set(tasks.map((task) => String(task.status || "queued")))).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select name="owner" defaultValue={ownerFilter} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
          <option value="all">All agents</option>
          {owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
        </select>
        <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Apply</button>
      </form>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-zinc-400">No tasks matched the current filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((task, index) => (
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
