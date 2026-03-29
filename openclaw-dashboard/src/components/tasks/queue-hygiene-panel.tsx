"use client";

import { useState } from "react";
import { GhostButton } from "@/components/ui/button-link";

const ACTIONS = [
  ['cancel-stale-approval', 'Cancel stale approvals', 'Retires needs_approval tasks that have gone stale and are no longer waiting on a meaningful human decision.'],
  ['cancel-superseded-failed', 'Cancel superseded failed', 'Clears failed tasks that were already made obsolete by a later successful attempt or newer equivalent work.'],
  ['requeue-stalled', 'Touch stale queued tasks', 'Refreshes old queued tasks so they are visibly acknowledged without changing them to a different status.'],
  ['retire-stale-backlog', 'Retire stale backlog', 'Cancels very old queued tasks so abandoned backlog items stop creating persistent operational noise.'],
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map(([action, label, description]) => (
            <div key={action} className="rounded-xl border border-white/8 bg-black/20 p-3">
              <GhostButton onClick={() => run(action)} disabled={pending !== null} className="w-full">{pending === action ? 'Running…' : label}</GhostButton>
              <div className="mt-2 text-xs leading-5 text-zinc-500">{description}</div>
            </div>
          ))}
        </div>
      </div>
      {message ? <div className="mt-3 text-sm text-zinc-400">{message}</div> : null}
    </section>
  );
}
