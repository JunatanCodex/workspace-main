import type { ReactNode } from "react";

export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <div className="w-full rounded-3xl border border-white/10 bg-zinc-950/90 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">OpenClaw Dashboard</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
