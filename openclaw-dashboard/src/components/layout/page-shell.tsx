import { ReactNode } from "react";

export function PageShell({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-white/6 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">OpenClaw</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </header>
      {children}
    </section>
  );
}
