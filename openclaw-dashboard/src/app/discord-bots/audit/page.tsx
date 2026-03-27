import { PageShell } from "@/components/layout/page-shell";
import { PremiumPanel } from "@/components/ui/premium";
import { readDiscordAudit } from "@/lib/discord-bots/runtime/audit-read";

export default async function DiscordBotsAuditPage() {
  const rows = await readDiscordAudit(200);
  return (
    <PageShell title="Discord Bot Audit" description="Execution, queue, auto-fix, and supervision audit trail for discord-bot-ops.">
      <div className="space-y-3">
        {rows.length === 0 ? <PremiumPanel className="text-zinc-400">No audit records yet.</PremiumPanel> : null}
        {rows.map((row, index) => (
          <PremiumPanel key={`${row.ts}-${index}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-zinc-100">{row.kind}</div>
                <div className="text-xs text-zinc-500">{new Date(row.ts).toLocaleString()}</div>
              </div>
              <div className="text-xs text-zinc-400">{row.botId || "fleet"}</div>
            </div>
            <pre className="mt-4 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-white/6 bg-black/20 p-3 text-xs text-zinc-300">{JSON.stringify(row, null, 2)}</pre>
          </PremiumPanel>
        ))}
      </div>
    </PageShell>
  );
}
