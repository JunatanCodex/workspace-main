"use client";

import { useState } from "react";
import { SolidButton } from "@/components/ui/button-link";

export function ArchiveNowButton({ taskId }: { taskId: string }) {
  const [message, setMessage] = useState('');

  async function run() {
    if (!window.confirm('Archive this completed task now?')) return;
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
      <SolidButton onClick={run}>Archive task</SolidButton>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}

export function RestoreTaskButton({ taskId }: { taskId: string }) {
  const [message, setMessage] = useState('');

  async function run() {
    if (!window.confirm('Restore this archived task back to the active queue?')) return;
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
      <SolidButton onClick={run}>Restore task</SolidButton>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
