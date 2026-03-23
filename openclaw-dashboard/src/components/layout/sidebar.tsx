import Link from "next/link";

const nav = [
  ["Overview", "/"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Business Pipeline", "/business-pipeline"],
  ["Developer Pipeline", "/developer-pipeline"],
  ["Digest", "/digest"],
  ["Routing", "/routing"],
  ["Alerts", "/alerts"],
  ["History", "/history"],
  ["Outputs", "/outputs"],
  ["Manual Control", "/actions"],
  ["Runtime Logs", "/runtime-logs"],
  ["CLI", "/cli"],
];

export function Sidebar() {
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
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white">
            <span>{label}</span>
            <span className="opacity-0 text-xs text-zinc-500 transition group-hover:opacity-100">→</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
