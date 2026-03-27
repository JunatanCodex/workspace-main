import type { AgentHealth, TaskStatus, TriggerType } from "@/lib/types";

const statusClasses: Record<string, string> = {
  idle: "border-white/10 bg-zinc-900 text-zinc-300",
  running: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  waiting: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  "needs approval": "border-rose-500/20 bg-rose-500/10 text-rose-300",
  error: "border-red-500/20 bg-red-500/10 text-red-300",
  offline: "border-white/10 bg-zinc-900 text-zinc-400",
  missing: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  queued: "border-white/10 bg-zinc-900 text-zinc-300",
  in_progress: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  needs_approval: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  blocked: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  cancelled: "border-white/10 bg-zinc-900 text-zinc-400",
  failed: "border-red-500/20 bg-red-500/10 text-red-300",
  healthy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  degraded: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  restarting: "border-sky-500/20 bg-sky-500/10 text-sky-300",
  stopped: "border-white/10 bg-zinc-900 text-zinc-400",
  on_demand: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  cron: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  heartbeat: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
  unknown: "border-white/10 bg-zinc-900 text-zinc-400",
};

export function StatusBadge({ value }: { value: AgentHealth | TaskStatus | TriggerType }) {
  const key = String(value);
  const classes = statusClasses[key] || statusClasses.unknown;
  return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap ${classes}`}>{key.replace(/_/g, " ")}</span>;
}
