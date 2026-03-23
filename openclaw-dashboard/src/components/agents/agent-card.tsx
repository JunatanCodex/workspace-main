import Link from "next/link";
import type { AgentDetails } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCalendarDateTime } from "@/lib/utils/time";

export function AgentCard({ agent }: { agent: AgentDetails }) {
  return (
    <Link href={`/agents/${agent.id}`} className="group rounded-2xl border border-white/8 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition hover:border-white/12 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-zinc-50">{agent.emoji ? `${agent.emoji} ` : ""}{agent.name}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-400">{agent.focus || agent.role || "No role extracted yet."}</div>
          {!agent.isRegistered ? <div className="mt-2 text-xs text-amber-300">Expected fleet member, not registered.</div> : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge value={agent.status} />
          <StatusBadge value={agent.triggerType} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-xs text-zinc-500 sm:grid-cols-3">
        <div>
          <div className="uppercase tracking-wide">Last run</div>
          <div className="mt-1 text-zinc-300">{formatCalendarDateTime(agent.lastRunTime)}</div>
        </div>
        <div>
          <div className="uppercase tracking-wide">Tasks</div>
          <div className="mt-1 text-zinc-300">{agent.pendingTasks.length} active</div>
        </div>
        <div>
          <div className="uppercase tracking-wide">Latest output</div>
          <div className="mt-1 truncate text-zinc-300">{agent.latestOutputFile?.name || "No output yet"}</div>
        </div>
      </div>
    </Link>
  );
}
