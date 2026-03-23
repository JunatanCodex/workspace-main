"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function CommandPalette({ items }: { items: Array<{ label: string; href: string; kind?: string }> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())), [items, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages, agents, tasks, and quick actions..."
          className="w-full border-b border-white/10 bg-transparent px-5 py-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filtered.map((item) => (
            <button
              key={`${item.href}-${item.label}`}
              onClick={() => {
                router.push(item.href);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>{item.label}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.kind || "item"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
