"use client";

export function ExportButton() {
  async function run() {
    const response = await fetch('/api/discord-bots/export');
    const json = await response.json();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discord-bots-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={run} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">Download export</button>;
}
