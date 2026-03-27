"use client";

import { useState } from "react";
import { ApprovalGate } from "@/components/discord-bots/approval-gate";

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
      {rollbackCommit ? <ApprovalGate label={pending ? 'Rolling back…' : 'Rollback to previous healthy commit'} confirmText={`rollback ${botId}`} onApprove={confirmRollback} /> : null}
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
