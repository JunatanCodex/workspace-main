"use client";

import Link from "next/link";
import { useState } from "react";

const primaryNav = [
  ["Overview", "/"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Business Pipeline", "/business-pipeline"],
  ["Developer Pipeline", "/developer-pipeline"],
  ["Pipelines", "/pipelines"],
  ["Digest", "/digest"],
  ["Maintenance", "/maintenance"],
  ["Routing", "/routing"],
  ["Alerts", "/alerts"],
  ["History", "/history"],
  ["Outputs", "/outputs"],
  ["Manual Control", "/actions"],
  ["Runtime Logs", "/runtime-logs"],
  ["CLI", "/cli"],
] as const;

const discordNav = [
  ["Overview", "/discord-bots"],
  ["Bot Metrics", "/discord-bots/metrics"],
  ["Bot Audit", "/discord-bots/audit"],
] as const;

export function Sidebar() {
  const [discordOpen, setDiscordOpen] = useState(true);

  return (
    <aside className="w-full border-b border-white/6 bg-[#0a0a0d]/90 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">OpenClaw</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">Agent Console</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-400">⌘K</div>
        </div>
        <div className="mt-3 text-sm text-zinc-400">Premium local dashboard for operational visibility, control, and pipelines.</div>
      </div>
      <nav className="grid gap-1 px-3 pb-5 lg:block">
        {primaryNav.map(([label, href]) => (
          <Link key={href} href={href} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white">
            <span>{label}</span>
            <span className="opacity-0 text-xs text-zinc-500 transition group-hover:opacity-100">→</span>
          </Link>
        ))}

        <div className="mt-2 rounded-xl border border-white/6 bg-black/20 p-1">
          <button onClick={() => setDiscordOpen((v) => !v)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white">
            <span>Discord Bots</span>
            <span className="text-xs text-zinc-500">{discordOpen ? '▾' : '▸'}</span>
          </button>
          {discordOpen ? (
            <div className="mt-1 space-y-1 px-1 pb-1">
              {discordNav.map(([label, href]) => (
                <Link key={href} href={href} className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
                  <span>{label}</span>
                  <span className="opacity-0 text-xs text-zinc-500 transition group-hover:opacity-100">→</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
