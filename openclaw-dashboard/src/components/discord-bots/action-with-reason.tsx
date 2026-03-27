"use client";

import { useState } from "react";

export function ActionWithReason({ action, botId }: { action: string; botId: string }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setMessage("");
    const response = await fetch('/api/discord-bots/run-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, action, reason }),
    });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? `${action} executed.` : json.error || `${action} failed.`);
  }

  return (
    <div className="space-y-3">
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={`Reason for ${action}`} className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
      <button onClick={run} disabled={pending} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">{pending ? 'Running…' : `Run ${action} with reason`}</button>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
