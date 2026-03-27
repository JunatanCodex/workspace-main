import { PageShell } from "@/components/layout/page-shell";
import { PremiumPanel, PremiumKicker } from "@/components/ui/premium";
import { getDiscordHealthReport, getDiscordIncidents } from "@/lib/discord-bots/store";

export default async function DiscordBotIncidentsPage() {
  const [health, incidents] = await Promise.all([getDiscordHealthReport(), getDiscordIncidents()]);
  return (
    <PageShell title="Health & Incidents" description="Incident tracking, severity, summaries, and the latest fleet health snapshot.">
      <div className="grid gap-4 lg:grid-cols-[1.1fr,1fr]">
        <PremiumPanel>
          <PremiumKicker>Health snapshot</PremiumKicker>
          <div className="mt-4 space-y-3">
            {(health.bots || []).map((bot) => (
              <div key={bot.bot_id} className="flex items-center justify-between rounded-xl border border-white/6 bg-black/20 px-3 py-2 text-sm">
                <span className="text-zinc-200">{bot.bot_id}</span>
                <span className="text-zinc-400">{bot.status} · {bot.health_score}</span>
              </div>
            ))}
            {!health.bots?.length ? <div className="text-sm text-zinc-500">No health data yet.</div> : null}
          </div>
        </PremiumPanel>
        <div className="space-y-3">
          {incidents.length === 0 ? <PremiumPanel className="text-zinc-400">No incidents recorded yet.</PremiumPanel> : null}
          {incidents.map((incident) => (
            <PremiumPanel key={incident.incident_id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-zinc-100">{incident.bot_id}</div>
                  <div className="text-xs text-zinc-500">{incident.incident_id}</div>
                </div>
                <div className="text-sm text-zinc-300">{incident.severity}</div>
              </div>
              <div className="mt-3 text-sm text-zinc-300">{incident.human_summary}</div>
              {incident.likely_cause ? <div className="mt-2 text-sm text-zinc-400">Likely cause: {incident.likely_cause}</div> : null}
            </PremiumPanel>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
