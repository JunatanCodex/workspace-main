import { PageShell } from "@/components/layout/page-shell";
import { TriggerLogList } from "@/components/logs/trigger-log-list";
import { getTriggerLogs } from "@/lib/runtime/read-trigger-logs";

export default async function RuntimeLogsPage() {
  const logs = await getTriggerLogs();
  return (
    <PageShell title="Runtime logs" description="Results of dashboard-triggered agent/orchestrator actions. These logs are local to the dashboard app and help verify trigger success/failure.">
      <TriggerLogList logs={logs} />
    </PageShell>
  );
}
