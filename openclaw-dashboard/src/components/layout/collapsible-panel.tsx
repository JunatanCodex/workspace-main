"use client";

import { ReactNode, useState } from "react";

export function CollapsiblePanel({
  title,
  description,
  action,
  children,
  defaultOpen = true,
  collapsedPreview,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsedPreview?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-left">
            <span className="text-lg font-semibold tracking-tight text-zinc-50">{title}</span>
            <span className="text-xs text-zinc-500 transition-transform duration-200" style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
          </button>
          {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
        </div>
        <div className="flex items-center gap-3">
          {action}
          <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.06]">
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">{children}</div>
      </div>

      <div className={`transition-all duration-300 ease-out ${open ? "max-h-0 overflow-hidden opacity-0" : "max-h-[1200px] opacity-100"}`}>
        {collapsedPreview || null}
      </div>
    </div>
  );
}
