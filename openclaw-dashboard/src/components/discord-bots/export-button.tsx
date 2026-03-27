"use client";

import { GhostButton } from "@/components/ui/button-link";

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

  return <GhostButton onClick={run}>Download export</GhostButton>;
}
