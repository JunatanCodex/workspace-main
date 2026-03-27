"use client";

import { useMemo, useState } from "react";

type Incident = {
  incident_id: string;
  bot_id: string;
  severity: string;
  human_summary: string;
  likely_cause?: string;
  resolved: boolean;
  resolved_at?: string | null;
};

export function IncidentFilter({ incidents }: { incidents: Incident[] }) {
  const [showResolved, setShowResolved] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => incidents.filter((incident) => {
    if (!showResolved && incident.resolved) return false;
    const raw = JSON.stringify(incident).toLowerCase();
    if (search && !raw.includes(search.toLowerCase())) return false;
    return true;
  }), [incidents, showResolved, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search incidents" className="min-w-64 rounded-xl border border-white/10 bg-[#0c0c12] px-3 py-2 text-sm text-zinc-300" />
        <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} /> Show resolved</label>
      </div>
      <div className="space-y-3">
        {filtered.map((incident) => (
          <div key={incident.incident_id} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">{incident.bot_id}</div>
                <div className="text-xs text-zinc-500">{incident.incident_id}</div>
              </div>
              <div className="text-sm text-zinc-300">{incident.severity}{incident.resolved ? ' · resolved' : ''}</div>
            </div>
            <div className="mt-3 text-sm text-zinc-300">{incident.human_summary}</div>
            {incident.likely_cause ? <div className="mt-2 text-sm text-zinc-400">Likely cause: {incident.likely_cause}</div> : null}
            {incident.resolved_at ? <div className="mt-2 text-xs text-zinc-500">Resolved at: {incident.resolved_at}</div> : null}
          </div>
        ))}
        {!filtered.length ? <div className="text-sm text-zinc-500">No incidents match the current filter.</div> : null}
      </div>
    </div>
  );
}
