"use client";

import { useState } from "react";
import { GhostButton } from "@/components/ui/button-link";

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
      <GhostButton onClick={() => run("monitor")} disabled={pending !== null}>Run fleet monitor</GhostButton>
      <GhostButton onClick={() => run("restart-degraded")} disabled={pending !== null}>Restart degraded bots</GhostButton>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
