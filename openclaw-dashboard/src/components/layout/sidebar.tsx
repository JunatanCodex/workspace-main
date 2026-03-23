import Link from "next/link";

const nav = [
  ["Overview", "/"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Digest", "/digest"],
  ["Routing", "/routing"],
  ["Alerts", "/alerts"],
  ["History", "/history"],
  ["Outputs", "/outputs"],
  ["Manual Control", "/actions"],
];

export function Sidebar() {
  return (
    <aside className="w-full border-b border-white/10 bg-zinc-950 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="px-5 py-4">
        <div className="text-lg font-semibold text-zinc-50">OpenClaw Dashboard</div>
        <div className="mt-1 text-sm text-zinc-400">Local fleet visibility for a solo operator.</div>
      </div>
      <nav className="grid gap-1 px-3 pb-4 lg:block">
        {nav.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-xl px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
