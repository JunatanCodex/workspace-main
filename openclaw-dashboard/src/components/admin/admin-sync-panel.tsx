"use client";

import { useState } from "react";

export function AdminSyncPanel({ canManage }: { canManage: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function runSync() {
    if (!canManage) return;
    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/sync", { method: "POST" });
      const payload = (await response.json()) as { ok?: boolean; error?: string; synced?: Record<string, number> };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Sync failed.");
      }
      setState("success");
      setMessage(`Synced ${payload.synced?.agents ?? 0} agents, ${payload.synced?.tasks ?? 0} tasks, ${payload.synced?.alerts ?? 0} alerts, and ${payload.synced?.pipelineRuns ?? 0} pipeline runs.`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Sync failed.");
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-zinc-50">Supabase sync</div>
          <div className="mt-2 text-sm text-zinc-400">Admin-only import from the current local dashboard state into Supabase tables.</div>
        </div>
        <button
          type="button"
          onClick={runSync}
          disabled={!canManage || state === "loading"}
          className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          {state === "loading" ? "Syncing..." : "Sync now"}
        </button>
      </div>
      {message ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${state === "error" ? "border-red-500/20 bg-red-500/10 text-red-200" : "border-white/10 bg-white/[0.03] text-zinc-300"}`}>
          {message}
        </div>
      ) : null}
      {!canManage ? <div className="mt-4 text-sm text-zinc-500">Admin or owner role required.</div> : null}
    </div>
  );
}
