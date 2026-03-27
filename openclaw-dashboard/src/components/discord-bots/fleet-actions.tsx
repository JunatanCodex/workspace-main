"use client";

import { useState } from "react";

export function FleetActions() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  async function run(action: "monitor" | "restart-degraded") {
    setPending(action);
    setMessage("");
    const response = await fetch("/api/discord-bots/fleet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await response.json();
    setPending(null);
    setMessage(response.ok ? json.message || `${action} completed.` : json.error || `${action} failed.`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={() => run("monitor")} disabled={pending !== null} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">Run fleet monitor</button>
      <button onClick={() => run("restart-degraded")} disabled={pending !== null} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">Restart degraded bots</button>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
