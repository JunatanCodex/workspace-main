"use client";

import Link from "next/link";
import { useLiveJson } from "@/hooks/use-live-json";
import { StatusBadge } from "@/components/ui/status-badge";
import { PremiumMetric, PremiumPanel } from "@/components/ui/premium";

type ApiShape = {
  bots: Array<{
    bot_id: string;
    name: string;
    status: string;
    repo_url: string;
    branch: string;
    current_commit?: string | null;
    last_deployed_at?: string | null;
    health_score: number;
    restart_count: number;
    uptime_label: string;
  }>;
  incidents: Array<{ incident_id: string }>;
  deployments: Array<{ deployment_id: string }>;
  health?: { updatedAt?: string | null; bots?: Array<{ bot_id: string; status: string; health_score: number }> };
  updatedAt: string;
};

export function DiscordBotsOverview({ initial }: { initial: ApiShape }) {
  const { data } = useLiveJson<ApiShape>("/api/discord-bots", initial);
  const bots = data.bots || [];
  const healthy = bots.filter((bot) => bot.status === "healthy").length;
  const degraded = bots.filter((bot) => bot.status === "degraded").length;
  const failed = bots.filter((bot) => bot.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <PremiumMetric label="Registered bots" value={bots.length} subtext="Tracked in the bot registry" />
        <PremiumMetric label="Healthy" value={healthy} subtext="Stable runtime state" />
        <PremiumMetric label="Degraded" value={degraded} subtext="Needs attention soon" />
        <PremiumMetric label="Failed" value={failed} subtext="Operator action likely needed" />
      </div>

      <PremiumPanel className="overflow-hidden p-0">
        <div className="border-b border-white/6 bg-white/[0.02] px-5 py-4">
          <div className="text-sm font-medium text-zinc-100">Bot fleet overview</div>
          <div className="mt-1 text-sm text-zinc-400">Status, repo metadata, deployment recency, and health score in one place.</div>
        </div>
        <table className="min-w-full divide-y divide-white/6 text-sm">
          <thead className="bg-white/[0.03] text-left text-zinc-400">
            <tr>
              {['Bot', 'Status', 'Repo', 'Branch', 'Commit', 'Last deploy', 'Health', 'Restarts'].map((label) => (
                <th key={label} className="px-4 py-3 font-medium">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {bots.map((bot) => (
              <tr key={bot.bot_id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/discord-bots/${bot.bot_id}`} className="font-medium text-zinc-100 hover:text-white">{bot.name}</Link>
                </td>
                <td className="px-4 py-3"><StatusBadge value={bot.status as never} /></td>
                <td className="px-4 py-3 text-zinc-300">{bot.repo_url}</td>
                <td className="px-4 py-3 text-zinc-300">{bot.branch}</td>
                <td className="px-4 py-3 text-zinc-400">{bot.current_commit || "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{bot.last_deployed_at ? new Date(bot.last_deployed_at).toLocaleString() : "Never"}</td>
                <td className="px-4 py-3 text-zinc-200">{bot.health_score}</td>
                <td className="px-4 py-3 text-zinc-400">{bot.restart_count}</td>
              </tr>
            ))}
            {bots.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-500">No Discord bots registered yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </PremiumPanel>
    </div>
  );
}
