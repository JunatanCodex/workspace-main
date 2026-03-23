import type { AgentHealth, TaskStatus, TriggerType } from "@/lib/types";

const statusClasses: Record<string, string> = {
  idle: "bg-zinc-800/80 text-zinc-100 border-zinc-700",
  running: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  waiting: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "needs approval": "bg-rose-500/20 text-rose-300 border-rose-500/30",
  error: "bg-red-500/20 text-red-300 border-red-500/30",
  offline: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  queued: "bg-zinc-700/50 text-zinc-200 border-zinc-600",
  in_progress: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  needs_approval: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  blocked: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  cancelled: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  error_task: "bg-red-500/20 text-red-300 border-red-500/30",
  on_demand: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  cron: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  heartbeat: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  unknown: "bg-zinc-700/50 text-zinc-300 border-zinc-600",
};

export function StatusBadge({ value }: { value: AgentHealth | TaskStatus | TriggerType }) {
  const key = value === "error" ? "error" : String(value);
  const classes = statusClasses[key] || statusClasses.unknown;
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}>{String(value)}</span>;
}
