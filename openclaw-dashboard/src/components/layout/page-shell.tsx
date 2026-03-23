import { ReactNode } from "react";

export function PageShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-zinc-50">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-zinc-400">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
