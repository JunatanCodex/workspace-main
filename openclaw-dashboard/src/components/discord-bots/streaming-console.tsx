"use client";

import { useEffect, useState } from "react";

export function StreamingConsole({ botId, initialLines }: { botId: string; initialLines: string[] }) {
  const [lines, setLines] = useState(initialLines);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/discord-bots/stream?botId=${encodeURIComponent(botId)}`);
    source.addEventListener('open', () => setConnected(true));
    source.addEventListener('logs', (event) => {
      const data = JSON.parse((event as MessageEvent).data || '{}');
      if (Array.isArray(data.lines)) setLines(data.lines);
    });
    source.onerror = () => setConnected(false);
    return () => source.close();
  }, [botId]);

  return (
    <div className="space-y-3">
      <div className="text-xs text-zinc-500">Stream: {connected ? 'connected' : 'disconnected'}</div>
      <div className="rounded-xl border border-white/6 bg-black/30 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all max-h-[70vh] overflow-auto">
        {lines.length ? lines.join('\n') : 'No log lines available.'}
      </div>
    </div>
  );
}
