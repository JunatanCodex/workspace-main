import { PageShell } from "@/components/layout/page-shell";
import { getDiscordDeployments } from "@/lib/discord-bots/store";

export default async function DiscordBotDeploymentsPage() {
  const deployments = await getDiscordDeployments();
  return (
    <PageShell title="Deployments History" description="Recorded deployment attempts, statuses, summaries, and rollback markers.">
      <div className="space-y-3">
        {deployments.length === 0 ? <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-zinc-400">No deployments recorded yet.</div> : null}
        {deployments.map((item) => (
          <div key={item.deployment_id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">{item.bot_id}</div>
                <div className="text-xs text-zinc-500">{item.deployment_id}</div>
              </div>
              <div className="text-sm text-zinc-300">{item.status}</div>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-400 md:grid-cols-2">
              <div>Started: {new Date(item.started_at).toLocaleString()}</div>
              <div>Finished: {item.finished_at ? new Date(item.finished_at).toLocaleString() : "—"}</div>
              <div>Branch: {item.branch}</div>
              <div>Commit: {item.commit || "—"}</div>
            </div>
            {item.summary ? <div className="mt-3 text-sm text-zinc-300">{item.summary}</div> : null}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
