import { PageShell } from "@/components/layout/page-shell";
import { PremiumPanel } from "@/components/ui/premium";
import { AuditFilter } from "@/components/discord-bots/audit-filter";
import { readDiscordAudit } from "@/lib/discord-bots/runtime/audit-read";

export default async function DiscordBotsAuditPage() {
  const rows = await readDiscordAudit(200);
  return (
    <PageShell title="Discord Bot Audit" description="Execution, queue, auto-fix, and supervision audit trail for discord-bot-ops.">
      {rows.length === 0 ? <PremiumPanel className="text-zinc-400">No audit records yet.</PremiumPanel> : <AuditFilter rows={rows} />}
    </PageShell>
  );
}
