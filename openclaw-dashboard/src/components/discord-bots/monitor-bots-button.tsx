"use client";

import { useState } from "react";

export function MonitorBotsButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function run() {
    setPending(true);
    setMessage("");
    const response = await fetch("/api/discord-bots/monitor", { method: "POST" });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? `Monitoring sweep complete. Queue handled: ${(json.queue?.handled || []).length}` : json.error || "Monitor sweep failed.");
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} disabled={pending} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] disabled:opacity-50">
        {pending ? "Running monitor..." : "Run monitor sweep"}
      </button>
      {message ? <span className="text-sm text-zinc-400">{message}</span> : null}
    </div>
  );
}
