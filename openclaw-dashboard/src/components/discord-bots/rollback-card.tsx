"use client";

import { useState } from "react";

export function RollbackCard({ botId, rollbackCommit, currentCommit }: { botId: string; rollbackCommit?: string | null; currentCommit?: string | null }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function confirmRollback() {
    if (!rollbackCommit) return;
    const yes = window.confirm(`Rollback ${botId} from ${currentCommit || 'current'} to ${rollbackCommit}?`);
    if (!yes) return;
    setPending(true);
    setMessage("");
    const response = await fetch("/api/discord-bots/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ botId }),
    });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? `Rollback queued/executed for ${rollbackCommit}.` : json.error || "Rollback failed.");
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-zinc-400">Current commit: {currentCommit || 'unknown'}</div>
      <div className="text-sm text-zinc-400">Rollback target: {rollbackCommit || 'not available yet'}</div>
      <button onClick={confirmRollback} disabled={!rollbackCommit || pending} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 disabled:opacity-50">{pending ? 'Rolling back...' : 'Rollback to previous healthy commit'}</button>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
