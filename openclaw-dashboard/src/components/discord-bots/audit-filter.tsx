"use client";

import { useMemo, useState } from "react";

export function AuditFilter({ rows }: { rows: Array<Record<string, unknown>> }) {
  const [search, setSearch] = useState("");
  const [botOnly, setBotOnly] = useState("");
  const filtered = useMemo(() => rows.filter((row) => {
    const raw = JSON.stringify(row).toLowerCase();
    if (search && !raw.includes(search.toLowerCase())) return false;
    if (botOnly && String(row.botId || "") !== botOnly) return false;
    return true;
  }), [rows, search, botOnly]);

  const botIds = Array.from(new Set(rows.map((row) => String(row.botId || "")).filter(Boolean))).sort();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audit records" className="min-w-64 rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
        <select value={botOnly} onChange={(e) => setBotOnly(e.target.value)} className="rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300">
          <option value="">All bots</option>
          {botIds.map((botId) => <option key={botId} value={botId}>{botId}</option>)}
        </select>
      </div>
      <div className="space-y-3">
        {filtered.map((row, index) => (
          <div key={`${String(row.ts || index)}-${index}`} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">{String(row.kind || "record")}</div>
                <div className="text-xs text-zinc-500">{String(row.ts || "")}</div>
              </div>
              <div className="text-xs text-zinc-400">{String(row.botId || "fleet")}</div>
            </div>
            <pre className="mt-4 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/6 bg-black/20 p-3 text-xs text-zinc-300">{JSON.stringify(row, null, 2)}</pre>
          </div>
        ))}
        {!filtered.length ? <div className="text-sm text-zinc-500">No audit records match the current filter.</div> : null}
      </div>
    </div>
  );
}
