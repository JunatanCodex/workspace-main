"use client";

import { useState } from "react";

export function ArchiveNowButton({ taskId }: { taskId: string }) {
  const [message, setMessage] = useState('');

  async function run() {
    const response = await fetch('/api/tasks/archive-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    const json = await response.json();
    setMessage(response.ok ? 'Task archived.' : json.error || 'Archive failed.');
  }

  return (
    <div className="space-y-3">
      <button onClick={run} className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Archive task</button>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}

export function RestoreTaskButton({ taskId }: { taskId: string }) {
  const [message, setMessage] = useState('');

  async function run() {
    const response = await fetch('/api/tasks/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    const json = await response.json();
    setMessage(response.ok ? 'Task restored to queue.' : json.error || 'Restore failed.');
  }

  return (
    <div className="space-y-3">
      <button onClick={run} className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Restore task</button>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
