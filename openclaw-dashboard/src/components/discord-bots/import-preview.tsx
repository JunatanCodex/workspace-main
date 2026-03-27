"use client";

import { useState } from "react";

export function ImportPreview() {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [fileText, setFileText] = useState("");

  async function previewFile(file: File) {
    const text = await file.text();
    setFileText(text);
    const response = await fetch('/api/discord-bots/import-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: text }),
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(json.error || 'Preview failed.');
      setPreview(null);
      return;
    }
    setPreview(json);
    setMessage('Preview ready.');
  }

  async function applyImport() {
    const response = await fetch('/api/discord-bots/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: fileText }),
    });
    const json = await response.json();
    setMessage(response.ok ? json.message || 'Import completed.' : json.error || 'Import failed.');
  }

  return (
    <div className="space-y-4">
      <input type="file" accept="application/json" onChange={(e) => { const f = e.target.files?.[0]; if (f) previewFile(f); }} className="block w-full text-sm text-zinc-400" />
      {message ? <div className="text-sm text-zinc-400">{message}</div> : null}
      {preview ? (
        <div className="space-y-3 rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <div className="text-sm text-zinc-300">Bots: {preview.registryCount} · Deployments: {preview.deploymentCount} · Incidents: {preview.incidentCount}</div>
          <div className="text-sm text-zinc-500">Signature valid: {String(preview.signatureValid)}</div>
          <button onClick={applyImport} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">Apply import</button>
        </div>
      ) : null}
    </div>
  );
}
