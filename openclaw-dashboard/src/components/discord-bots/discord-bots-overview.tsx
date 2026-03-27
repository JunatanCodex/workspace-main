"use client";

import Link from "next/link";
import { useLiveJson } from "@/hooks/use-live-json";
import { StatusBadge } from "@/components/ui/status-badge";

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
        {[
          ["Registered bots", String(bots.length)],
          ["Healthy", String(healthy)],
          ["Degraded", String(degraded)],
          ["Failed", String(failed)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-50">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#09090c]">
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
      </div>
    </div>
  );
}
