"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primaryNav = [
  ["Overview", "/"],
  ["Agents", "/agents"],
  ["Business Pipeline", "/business-pipeline"],
  ["Developer Pipeline", "/developer-pipeline"],
  ["Digest", "/digest"],
  ["Maintenance", "/maintenance"],
  ["Routing", "/routing"],
  ["Alerts", "/alerts"],
  ["History", "/history"],
  ["Manual Control", "/actions"],
  ["Runtime Logs", "/runtime-logs"],
  ["CLI", "/cli"],
] as const;

const groupedNav = {
  tasks: {
    label: "Tasks",
    base: "/tasks",
    items: [
      ["Board", "/tasks"],
      ["Archived", "/tasks/archived"],
    ],
  },
  discord: {
    label: "Discord Bots",
    base: "/discord-bots",
    items: [
      ["Overview", "/discord-bots"],
      ["Bot Metrics", "/discord-bots/metrics"],
      ["Bot Audit", "/discord-bots/audit"],
    ],
  },
  pipelines: {
    label: "Pipelines",
    base: "/pipelines",
    items: [
      ["Overview", "/pipelines"],
      ["Business Pipeline", "/business-pipeline"],
      ["Developer Pipeline", "/developer-pipeline"],
    ],
  },
  outputs: {
    label: "Outputs",
    base: "/outputs",
    items: [
      ["Overview", "/outputs"],
    ],
  },
} as const;

function Group({ label, open, setOpen, items }: { label: string; open: boolean; setOpen: (value: boolean) => void; items: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white">
        <span>{label}</span>
        <span className="text-xs text-zinc-500 transition group-hover:text-zinc-300">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="mt-1 space-y-1 pl-3">
          {items.map(([childLabel, href]) => (
            <Link key={href} href={href} className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
              <span>{childLabel}</span>
              <span className="opacity-0 text-xs text-zinc-500 transition group-hover:opacity-100">→</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [tasksOpen, setTasksOpen] = useState(false);
  const [discordOpen, setDiscordOpen] = useState(false);
  const [pipelinesOpen, setPipelinesOpen] = useState(false);
  const [outputsOpen, setOutputsOpen] = useState(false);

  useEffect(() => {
    setTasksOpen(pathname.startsWith(groupedNav.tasks.base));
    setDiscordOpen(pathname.startsWith(groupedNav.discord.base));
    setPipelinesOpen(pathname.startsWith(groupedNav.pipelines.base) || pathname === '/business-pipeline' || pathname === '/developer-pipeline');
    setOutputsOpen(pathname.startsWith(groupedNav.outputs.base));
  }, [pathname]);

  return (
    <aside className="w-full border-b border-white/6 bg-[#0a0a0d]/90 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">OpenClaw</div>
            <div className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">Junatan Console</div>
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

        <Group label={groupedNav.tasks.label} open={tasksOpen} setOpen={setTasksOpen} items={groupedNav.tasks.items} />
        <Group label={groupedNav.discord.label} open={discordOpen} setOpen={setDiscordOpen} items={groupedNav.discord.items} />
        <Group label={groupedNav.pipelines.label} open={pipelinesOpen} setOpen={setPipelinesOpen} items={groupedNav.pipelines.items} />
        <Group label={groupedNav.outputs.label} open={outputsOpen} setOpen={setOutputsOpen} items={groupedNav.outputs.items} />
      </nav>
    </aside>
  );
}
