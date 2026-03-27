"use client";

import { useMemo, useState } from "react";

export function ConsoleView({ initialLines }: { initialLines: string[] }) {
  const [filter, setFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [search, setSearch] = useState("");

  const lines = useMemo(() => {
    return initialLines.filter((line) => {
      if (filter !== "all" && !line.includes(`\"kind\":\"${filter}\"`)) return false;
      if (search && !line.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search, initialLines]);

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
      </div>
      <div className="rounded-xl border border-white/6 bg-black/30 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all max-h-[70vh] overflow-auto">
        {lines.length ? lines.join("\n") : "No log lines match the current filter."}
      </div>
    </div>
  );
}
