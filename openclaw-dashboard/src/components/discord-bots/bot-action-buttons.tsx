"use client";

import { useState } from "react";

const ACTIONS = ["start", "stop", "restart", "redeploy", "pull-latest", "rollback", "diagnose"] as const;

export function BotActionButtons({ botId, enabledActions }: { botId: string; enabledActions: string[] }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [mode, setMode] = useState<"queue" | "run-now">("queue");

  async function run(action: typeof ACTIONS[number]) {
    setPending(action);
    setMessage("");
    const endpoint = mode === "run-now" ? "/api/discord-bots/run-action" : "/api/discord-bots/action";
    const payload = mode === "run-now" ? { botId, action } : { kind: "action", botId, action };
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setPending(null);
    setMessage(response.ok ? (mode === "run-now" ? `${action} executed.` : `Queued ${action} action.`) : json.error || `Failed to ${mode === "run-now" ? "execute" : "queue"} ${action}.`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span>Mode</span>
        <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300">
          <option value="queue">queue</option>
          <option value="run-now">run now</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.filter((action) => enabledActions.includes(action)).map((action) => (
          <button
            key={action}
            disabled={pending === action}
            onClick={() => run(action)}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.08] disabled:opacity-50"
          >
            {pending === action ? `Queueing ${action}...` : action}
          </button>
        ))}
      </div>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
