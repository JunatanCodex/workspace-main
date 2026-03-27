import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { BotActionButtons } from "@/components/discord-bots/bot-action-buttons";
import { getDiscordBotById } from "@/lib/discord-bots/store";

export default async function DiscordBotDetailPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  const bot = await getDiscordBotById(botId);
  if (!bot) return notFound();

  return (
    <PageShell
      title={bot.name}
      description="Bot metadata, runtime state, deployment status, incidents, secrets presence, and safe actions."
      actions={<Link href={`/discord-bots/${bot.bot_id}/console`} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">Open Console</Link>}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">Runtime status</div>
                <div className="mt-2"><StatusBadge value={bot.status as never} /></div>
              </div>
              <div className="text-right text-sm text-zinc-400">
                <div>Health score: {bot.health_score}</div>
                <div>Restarts: {bot.restart_count}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-zinc-400 md:grid-cols-2">
              <div>Repo: {bot.repo_url}</div>
              <div>Branch: {bot.branch}</div>
              <div>Commit: {bot.current_commit || "—"}</div>
              <div>Last deploy: {bot.last_deployed_at ? new Date(bot.last_deployed_at).toLocaleString() : "Never"}</div>
              <div>Last healthy: {bot.last_healthy_at ? new Date(bot.last_healthy_at).toLocaleString() : "Never"}</div>
              <div>Rollback commit: {bot.previous_healthy_commit || "—"}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-zinc-100">Action controls</div>
            <div className="mt-4"><BotActionButtons botId={bot.bot_id} enabledActions={bot.available_actions} /></div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-zinc-100">Configured env vars</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {bot.masked_env.map((env) => (
                <div key={env.name} className="rounded-xl border border-white/6 px-3 py-2 text-sm text-zinc-300">
                  {env.name} · {env.configured ? "configured" : "missing"}
                </div>
              ))}
              {!bot.masked_env.length ? <div className="text-sm text-zinc-500">No env vars registered.</div> : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-zinc-100">Latest deployment</div>
            {bot.last_deployment ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-400">
                <div>ID: {bot.last_deployment.deployment_id}</div>
                <div>Status: {bot.last_deployment.status}</div>
                <div>Started: {new Date(bot.last_deployment.started_at).toLocaleString()}</div>
                <div>Summary: {bot.last_deployment.summary || "—"}</div>
              </div>
            ) : <div className="mt-3 text-sm text-zinc-500">No deployment record yet.</div>}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-zinc-100">Last incident</div>
            {bot.last_incident ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-400">
                <div>ID: {bot.last_incident.incident_id}</div>
                <div>Severity: {bot.last_incident.severity}</div>
                <div>Summary: {bot.last_incident.human_summary}</div>
                <div>Escalation required: {bot.last_incident.escalation_required ? "yes" : "no"}</div>
              </div>
            ) : <div className="mt-3 text-sm text-zinc-500">No incidents yet.</div>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
