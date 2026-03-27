"use client";

import { useState } from "react";

export function ImportRestore() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function upload(file: File) {
    const text = await file.text();
    setPending(true);
    setMessage("");
    const response = await fetch('/api/discord-bots/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: text }),
    });
    const json = await response.json();
    setPending(false);
    setMessage(response.ok ? json.message || 'Import completed.' : json.error || 'Import failed.');
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} className="block w-full text-sm text-zinc-400" />
      {pending ? <div className="text-sm text-zinc-400">Importing…</div> : null}
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
    </div>
  );
}
