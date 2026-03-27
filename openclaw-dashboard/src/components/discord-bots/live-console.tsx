"use client";

import { useEffect, useMemo, useState } from "react";

export function LiveConsole({ botId, initialLines }: { botId: string; initialLines: string[] }) {
  const [lines, setLines] = useState(initialLines);
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(async () => {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search) params.set("search", search);
      const response = await fetch(`/api/discord-bots/${botId}/console?${params.toString()}`);
      const json = await response.json();
      setLines(Array.isArray(json.lines) ? json.lines : []);
    }, 4000);
    return () => clearInterval(id);
  }, [autoRefresh, botId, filter, search]);

  const filtered = useMemo(() => lines, [lines]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300">
          <option value="all">all</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs" className="min-w-56 rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
        <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh</label>
      </div>
      <div className="rounded-xl border border-white/6 bg-black/30 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all max-h-[70vh] overflow-auto">
        {filtered.length ? filtered.join("\n") : "No log lines available."}
      </div>
    </div>
  );
}
