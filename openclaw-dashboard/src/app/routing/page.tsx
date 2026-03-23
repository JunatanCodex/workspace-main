import { PageShell } from "@/components/layout/page-shell";
import { getAgents } from "@/lib/fs/agents";
import { getRoutingMap } from "@/lib/fs/routing";

export default async function RoutingPage() {
  const [routing, agents] = await Promise.all([getRoutingMap(), getAgents()]);
  const knownAgents = new Set(agents.map((agent) => agent.id));
  const routes = Object.entries(routing.routes || {});

  return (
    <PageShell title="Routing map" description="Readable view of ~/.openclaw/shared/routing-map.json with basic validation warnings.">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-sm text-zinc-300">
          <div>Fallback agent: <span className="font-medium text-zinc-100">{routing.fallback || "—"}</span></div>
          <div className="mt-2 text-zinc-500">Updated at: {routing.updatedAt || "—"}</div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03] text-left text-zinc-400">
              <tr><th className="px-4 py-3">Task type</th><th className="px-4 py-3">Assigned agent</th><th className="px-4 py-3">Warnings</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {routes.map(([type, owner]) => (
                <tr key={type}>
                  <td className="px-4 py-4 text-zinc-200">{type}</td>
                  <td className="px-4 py-4 text-zinc-200">{owner}</td>
                  <td className="px-4 py-4 text-zinc-400">{knownAgents.has(owner) ? "—" : `Invalid agent reference: ${owner}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
