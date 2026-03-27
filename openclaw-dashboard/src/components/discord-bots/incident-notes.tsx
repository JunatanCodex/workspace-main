"use client";

import { useState } from "react";

export function IncidentNotes({ incidentId, notes = [] }: { incidentId: string; notes?: Array<{ at: string; note: string }> }) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  async function addNote() {
    const response = await fetch('/api/discord-bots/incident-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, note: value }),
    });
    const json = await response.json();
    setMessage(response.ok ? 'Note added. Refresh to see latest note trail.' : json.error || 'Failed to add note.');
    if (response.ok) setValue('');
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {notes.map((entry, index) => <div key={`${entry.at}-${index}`} className="rounded-xl border border-white/6 bg-black/20 px-3 py-2 text-sm text-zinc-300">{entry.at} · {entry.note}</div>)}
        {!notes.length ? <div className="text-sm text-zinc-500">No incident notes yet.</div> : null}
      </div>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} placeholder="Add operator note / postmortem / follow-up" className="w-full rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
      <div className="flex items-center gap-3">
        <button onClick={addNote} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">Add note</button>
        {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
      </div>
    </div>
  );
}
