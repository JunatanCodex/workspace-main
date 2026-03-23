import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CLI_COMMANDS } from "@/lib/cli/registry";
import { readCliHistory } from "@/lib/cli/history";

export default async function CliPage() {
  const history = await readCliHistory(30);
  return (
    <PageShell title="CLI control & debug" description="Allow-listed backend command layer for OpenClaw actions. Unsupported items are shown explicitly instead of being silently ignored.">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Supported commands" description="Central registry of backend-executable actions." />
          <div className="space-y-3">
            {CLI_COMMANDS.map((command) => (
              <div key={command.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-zinc-100">{command.label}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{command.support}</div>
                </div>
                <div className="mt-2 text-sm text-zinc-400">{command.description}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
          <SectionHeader title="Recent executions" description="Last backend-executed CLI actions with status and output preview." />
          {history.length ? (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-zinc-100">{entry.label}</div>
                    <div className={`text-xs uppercase tracking-[0.18em] ${entry.ok ? "text-emerald-300" : "text-red-300"}`}>{entry.ok ? "ok" : "failed"}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{entry.timestamp}</div>
                  {entry.note ? <div className="mt-2 text-sm text-zinc-400">{entry.note}</div> : null}
                  {entry.stdout ? <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-black/30 p-3 text-xs text-zinc-300">{entry.stdout.slice(0, 1000)}</pre> : null}
                  {entry.stderr ? <pre className="mt-3 overflow-x-auto rounded-xl border border-red-500/10 bg-red-500/[0.05] p-3 text-xs text-red-200">{entry.stderr.slice(0, 1000)}</pre> : null}
                </div>
              ))}
            </div>
          ) : <EmptyState title="No CLI history yet" description="Once backend actions run through the CLI service, execution history will appear here." />}
        </section>
      </div>
    </PageShell>
  );
}
