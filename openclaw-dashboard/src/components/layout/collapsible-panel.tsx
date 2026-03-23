"use client";

import { ReactNode, useState } from "react";

export function CollapsiblePanel({
  title,
  description,
  action,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-left">
            <span className="text-lg font-semibold tracking-tight text-zinc-50">{title}</span>
            <span className="text-xs text-zinc-500">{open ? "▾" : "▸"}</span>
          </button>
          {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06]">
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>
      {open ? children : null}
    </div>
  );
}
