"use client";

import { useState } from "react";

export function BulkActions({ botIds }: { botIds: string[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [action, setAction] = useState<"restart" | "redeploy" | "stop">("restart");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function toggle(botId: string) {
    setSelected((current) => current.includes(botId) ? current.filter((id) => id !== botId) : [...current, botId]);
  }

  async function run() {
    if (!selected.length) return;
    const risky = action === "stop" || action === "redeploy";
    if (risky && !window.confirm(`Run ${action} on ${selected.length} selected bot(s)?`)) return;
    setPending(true);
    setMessage("");
    const response = await fetch("/api/discord-bots/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botIds: selected, action }),
    });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? json.message || "Bulk action complete." : json.error || "Bulk action failed.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {botIds.map((botId) => (
          <label key={botId} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-zinc-300">
            <input type="checkbox" checked={selected.includes(botId)} onChange={() => toggle(botId)} />
            {botId}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select value={action} onChange={(e) => setAction(e.target.value as typeof action)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300">
          <option value="restart">restart</option>
          <option value="redeploy">redeploy</option>
          <option value="stop">stop</option>
        </select>
        <button onClick={run} disabled={!selected.length || pending} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">{pending ? 'Running…' : 'Run bulk action'}</button>
        {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
      </div>
    </div>
  );
}
