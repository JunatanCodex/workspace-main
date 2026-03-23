import { formatDateTime } from "@/lib/utils/time";
import type { TriggerLogEntry } from "@/lib/runtime/read-trigger-logs";

export function TriggerLogList({ logs }: { logs: TriggerLogEntry[] }) {
  if (!logs.length) {
    return <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-zinc-400">No dashboard-triggered runtime logs yet.</div>;
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={`${log.startedAt || "log"}-${index}`} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium text-zinc-100">{log.agentId || "unknown-agent"}</div>
              <div className="mt-1 text-sm text-zinc-500">Started: {formatDateTime(log.startedAt)}</div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-medium ${log.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
              {log.ok ? "success" : "failed"}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Message</div>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs whitespace-pre-wrap text-zinc-300">{log.message || "—"}</pre>
            </div>
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Result</div>
              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-4 text-xs whitespace-pre-wrap text-zinc-300">{log.error || log.stderr || log.stdout || "No output captured."}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
