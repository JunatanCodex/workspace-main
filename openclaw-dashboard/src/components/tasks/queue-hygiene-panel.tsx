"use client";

import { useState } from "react";

const ACTIONS = [
  ['cancel-stale-approval', 'Cancel stale approvals'],
  ['cancel-superseded-failed', 'Cancel superseded failed'],
  ['requeue-stalled', 'Touch stale queued tasks'],
] as const;

export function QueueHygienePanel({ staleApprovalCount }: { staleApprovalCount: number }) {
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  async function run(action: typeof ACTIONS[number][0]) {
    setPending(action);
    setMessage('');
    const response = await fetch('/api/tasks/hygiene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const json = await response.json();
    setPending(null);
    setMessage(response.ok ? json.message || 'Queue hygiene complete.' : json.error || 'Queue hygiene failed.');
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-100">Queue hygiene</div>
          <div className="mt-1 text-sm text-zinc-400">Stale approval debt: {staleApprovalCount}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACTIONS.map(([action, label]) => (
            <button key={action} onClick={() => run(action)} disabled={pending !== null} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 disabled:opacity-50">{pending === action ? 'Running…' : label}</button>
          ))}
        </div>
      </div>
      {message ? <div className="mt-3 text-sm text-zinc-400">{message}</div> : null}
    </section>
  );
}
