"use client";

import { useState } from "react";

export function OperatorRoleSwitcher({ initialRole }: { initialRole: 'viewer' | 'operator' | 'admin' }) {
  const [role, setRole] = useState(initialRole);
  const [message, setMessage] = useState('');

  async function update(nextRole: 'viewer' | 'operator' | 'admin') {
    setRole(nextRole);
    const response = await fetch('/api/discord-bots/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    });
    const json = await response.json();
    setMessage(response.ok ? `Active role set to ${json.activeRole}.` : json.error || 'Failed to update role.');
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={role} onChange={(e) => update(e.target.value as typeof role)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300">
        <option value="viewer">viewer</option>
        <option value="operator">operator</option>
        <option value="admin">admin</option>
      </select>
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
