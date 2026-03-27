"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const primaryNav = [
  ["⌂", "Overview", "/"],
  ["◫", "Agents", "/agents"],
  ["◎", "Business Pipeline", "/business-pipeline"],
  ["◈", "Developer Pipeline", "/developer-pipeline"],
  ["☰", "Digest", "/digest"],
  ["✦", "Maintenance", "/maintenance"],
  ["⇄", "Routing", "/routing"],
  ["⚠", "Alerts", "/alerts"],
  ["↺", "History", "/history"],
  ["✎", "Manual Control", "/actions"],
  ["▤", "Runtime Logs", "/runtime-logs"],
  ["⌘", "CLI", "/cli"],
] as const;

const groupedNav = {
  tasks: {
    icon: "☷",
    label: "Tasks",
    base: "/tasks",
    items: [
      ["Board", "/tasks"],
      ["Archived", "/tasks/archived"],
    ],
  },
  discord: {
    icon: "◉",
    label: "Discord Bots",
    base: "/discord-bots",
    items: [
      ["Overview", "/discord-bots"],
      ["Bot Metrics", "/discord-bots/metrics"],
      ["Bot Audit", "/discord-bots/audit"],
    ],
  },
  pipelines: {
    icon: "⋯",
    label: "Pipelines",
    base: "/pipelines",
    items: [
      ["Overview", "/pipelines"],
      ["Business Pipeline", "/business-pipeline"],
      ["Developer Pipeline", "/developer-pipeline"],
    ],
  },
  outputs: {
    icon: "▣",
    label: "Outputs",
    base: "/outputs",
    items: [
      ["Overview", "/outputs"],
    ],
  },
} as const;

function useSessionStoredOpenState(key: string, initialValue: boolean) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null;
    if (stored !== null) setValue(stored === '1');
  }, [key]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value ? '1' : '0');
  }, [key, value]);

  return [value, setValue] as const;
}

function Group({
  icon,
  label,
  open,
  setOpen,
  items,
  pathname,
}: {
  icon: string;
  label: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  items: readonly (readonly [string, string])[];
  pathname: string;
}) {
  const active = items.some(([, href]) => pathname === href || (href !== '/' && pathname.startsWith(href)));

  return (
    <div>
      <button onClick={() => setOpen(!open)} className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white/[0.05] text-white' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'}`}>
        <span className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-xs text-zinc-500 transition group-hover:text-zinc-300">{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div className="mt-1 space-y-1 pl-3">
          {items.map(([childLabel, href]) => {
            const childActive = pathname === href;
            return (
              <Link key={href} href={href} className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition ${childActive ? 'bg-white/[0.06] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}>
                <span>{childLabel}</span>
                <span className={`text-xs transition ${childActive ? 'opacity-100 text-zinc-300' : 'opacity-0 text-zinc-500 group-hover:opacity-100'}`}>→</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [tasksOpen, setTasksOpen] = useSessionStoredOpenState('sidebar:tasks', false);
  const [discordOpen, setDiscordOpen] = useSessionStoredOpenState('sidebar:discord', false);
  const [pipelinesOpen, setPipelinesOpen] = useSessionStoredOpenState('sidebar:pipelines', false);
  const [outputsOpen, setOutputsOpen] = useSessionStoredOpenState('sidebar:outputs', false);

  useEffect(() => {
    if (pathname.startsWith(groupedNav.tasks.base)) setTasksOpen(true);
    if (pathname.startsWith(groupedNav.discord.base)) setDiscordOpen(true);
    if (pathname.startsWith(groupedNav.pipelines.base) || pathname === '/business-pipeline' || pathname === '/developer-pipeline') setPipelinesOpen(true);
    if (pathname.startsWith(groupedNav.outputs.base)) setOutputsOpen(true);
  }, [pathname, setTasksOpen, setDiscordOpen, setPipelinesOpen, setOutputsOpen]);

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
        {primaryNav.map(([icon, label, href]) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-white/[0.05] text-white' : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'}`}>
              <span className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{icon}</span>
                <span>{label}</span>
              </span>
              <span className={`text-xs transition ${active ? 'opacity-100 text-zinc-300' : 'opacity-0 text-zinc-500 group-hover:opacity-100'}`}>→</span>
            </Link>
          );
        })}

        <Group icon={groupedNav.tasks.icon} label={groupedNav.tasks.label} open={tasksOpen} setOpen={setTasksOpen} items={groupedNav.tasks.items} pathname={pathname} />
        <Group icon={groupedNav.discord.icon} label={groupedNav.discord.label} open={discordOpen} setOpen={setDiscordOpen} items={groupedNav.discord.items} pathname={pathname} />
        <Group icon={groupedNav.pipelines.icon} label={groupedNav.pipelines.label} open={pipelinesOpen} setOpen={setPipelinesOpen} items={groupedNav.pipelines.items} pathname={pathname} />
        <Group icon={groupedNav.outputs.icon} label={groupedNav.outputs.label} open={outputsOpen} setOpen={setOutputsOpen} items={groupedNav.outputs.items} pathname={pathname} />
      </nav>
    </aside>
  );
}
