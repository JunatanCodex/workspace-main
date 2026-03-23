"use client";

import { useEffect, useState } from "react";
import { DEFAULT_REFRESH_MS, REFRESH_INTERVALS } from "@/lib/refresh/config";
import { formatTime } from "@/lib/utils/time";

function initialEnabled() {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("openclaw-refresh-enabled");
  return saved ? JSON.parse(saved) : true;
}

function initialInterval() {
  if (typeof window === "undefined") return DEFAULT_REFRESH_MS;
  const saved = localStorage.getItem("openclaw-refresh-interval");
  return saved ? Number(saved) : DEFAULT_REFRESH_MS;
}

export function RefreshControl() {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [intervalMs, setIntervalMs] = useState(initialInterval);
  const [lastUpdated, setLastUpdated] = useState<string>(formatTime(new Date().toISOString()));

  useEffect(() => {
    const onUpdated = () => setLastUpdated(formatTime(new Date().toISOString()));
    window.addEventListener("openclaw:refresh", onUpdated);
    return () => window.removeEventListener("openclaw:refresh", onUpdated);
  }, []);

  useEffect(() => {
    localStorage.setItem("openclaw-refresh-enabled", JSON.stringify(enabled));
    localStorage.setItem("openclaw-refresh-interval", String(intervalMs));
    window.dispatchEvent(new CustomEvent("openclaw:refresh-settings"));
  }, [enabled, intervalMs]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300">
      <button type="button" onClick={() => setEnabled((v: boolean) => !v)} className={`rounded-lg px-2 py-1 ${enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.04] text-zinc-400"}`}>
        {enabled ? "Live on" : "Live off"}
      </button>
      <select value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value))} className="bg-transparent text-zinc-300 outline-none">
        {REFRESH_INTERVALS.map((value) => <option key={value} value={value} className="bg-zinc-950">{value / 1000}s</option>)}
      </select>
      <span className="text-zinc-500">Updated {lastUpdated}</span>
    </div>
  );
}
